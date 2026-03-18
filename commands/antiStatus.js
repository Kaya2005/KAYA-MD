// ==================== commands/antistatus.js ====================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

const DATA_DIR = path.join(process.cwd(), "data");
const STATUS_FILE = path.join(DATA_DIR, "antistatus.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch { return {}; }
};
const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

global.antiStatusGroups ??= loadJSON(STATUS_FILE);
const saveAntiStatusGroups = () => saveJSON(STATUS_FILE, global.antiStatusGroups);

export default {
  name: "antistatus",
  description: "Automatically deletes status/story mentions in the group",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (sock, m, args) => {
    try {
      const chatId = m.chat;
      const check = await checkAdminOrOwner(sock, chatId, m.sender);
      if (!check.isAdminOrOwner) return sock.sendMessage(chatId, { text: "🚫 Admins only." }, { quoted: m });

      const action = args[0]?.toLowerCase();
      if (!action || !["on","off","status"].includes(action)) {
        return sock.sendMessage(chatId, { text:
`📌 AntiStatus Command
.antistatus on     → Enable
.antistatus off    → Disable
.antistatus status → Check status`
        }, { quoted: m });
      }

      if (action === "status") {
        const data = global.antiStatusGroups[chatId];
        return sock.sendMessage(chatId, { text: data?.enabled ? "✅ AntiStatus ENABLED" : "❌ AntiStatus DISABLED" }, { quoted: m });
      }

      if (action === "on") global.antiStatusGroups[chatId] = { enabled: true };
      else if (action === "off") delete global.antiStatusGroups[chatId];

      saveAntiStatusGroups();

      return sock.sendMessage(chatId, { text: action === "on" ? "✅ AntiStatus enabled" : "❌ AntiStatus disabled" }, { quoted: m });

    } catch (err) {
      console.error("❌ antistatus.js error:", err);
      sock.sendMessage(m.chat, { text: "❌ AntiStatus error." }, { quoted: m });
    }
  },

  detect: async (sock, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const chatId = m.chat;
      const data = global.antiStatusGroups[chatId];
      if (!data?.enabled) return;

      // Check if bot is admin
      const meta = await sock.groupMetadata(chatId);
      const botId = sock.user.id.includes("@s.whatsapp.net") ? sock.user.id : `${sock.user.id}@s.whatsapp.net`;
      const bot = meta.participants.find(p => p.id === botId);
      if (!bot?.admin) return;

      // Ignore admins
      const senderData = meta.participants.find(p => p.id === m.sender);
      if (senderData?.admin) return;

      // Check if the message is a status/story mention
      if (!m.message?.protocolMessage && !m.message?.reactionMessage) return;

      // Delete the message
      try {
        await sock.sendMessage(chatId, { delete: m.key });
        console.log(`✅ AntiStatus: deleted message from ${m.pushName || m.sender}`);
      } catch {
        await sock.sendMessage(chatId, {
          text: "❌ I cannot delete this message, maybe I'm not admin?",
        }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ AntiStatus detect error:", err);
    }
  }
};