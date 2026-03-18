import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "antiTagGroups.json");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ----------------- Load / Save -----------------
function loadData() {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ----------------- Global Init -----------------
global.antiTagGroups ??= loadData();

// ----------------- Utils -----------------
function isTagAllOrMentions(m) {
  const text = m.body || m.caption || "";
  const mentions = m.mentionedJid || [];
  return mentions.length > 0 || /@all/i.test(text);
}

// ==================== Module ====================
export default {
  name: "antitag",
  alias: ["anti-tag"],
  description: "🚫 Anti tagall / mentions",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      if (!m.isGroup)
        return kaya.sendMessage(chatId, { text: "❌ Only works in groups." }, { quoted: m });

      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdminOrOwner)
        return kaya.sendMessage(chatId, { text: "🚫 Only admins or owner can use this command." }, { quoted: m });

      // ✅ Show help
      if (!action) {
        return kaya.sendMessage(chatId, {
          text:
`🚫 *ANTITAG COMMAND*

.antitag on      → Enable anti-tag (DELETE)
.antitag off     → Disable anti-tag
.antitag set delete | kick
.antitag get     → Show status`
        }, { quoted: m });
      }

      // 📊 STATUS
      if (action === "get") {
        const data = global.antiTagGroups[chatId];
        return kaya.sendMessage(chatId, {
          text: `📊 *ANTITAG STATUS*\n• State: ${data?.enabled ? "ON ✅" : "OFF ❌"}\n• Action: ${data?.action || "—"}`
        }, { quoted: m });
      }

      // ⚙️ ACTIONS
      if (action === "on") {
        global.antiTagGroups[chatId] = { enabled: true, action: "delete" };
        saveData(global.antiTagGroups);
        return kaya.sendMessage(chatId, { text: "✅ Anti-tag enabled (DELETE)." }, { quoted: m });
      }

      if (action === "off") {
        delete global.antiTagGroups[chatId];
        saveData(global.antiTagGroups);
        return kaya.sendMessage(chatId, { text: "❌ Anti-tag disabled." }, { quoted: m });
      }

      if (action === "set") {
        const mode = args[1];
        if (!["delete", "kick"].includes(mode))
          return kaya.sendMessage(chatId, { text: "⚠️ Usage: .antitag set delete | kick" }, { quoted: m });

        global.antiTagGroups[chatId] = { enabled: true, action: mode };
        saveData(global.antiTagGroups);
        return kaya.sendMessage(chatId, { text: `⚙️ Anti-tag action set to: ${mode.toUpperCase()}` }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ ANTITAG COMMAND ERROR:", err);
      await kaya.sendMessage(m.chat, { text: "❌ Error executing antitag." }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const data = global.antiTagGroups[m.chat];
      if (!data?.enabled) return;

      const check = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (check.isAdminOrOwner) return;

      if (!isTagAllOrMentions(m)) return;

      // 🗑️ Delete message
      try { await kaya.sendMessage(m.chat, { delete: m.key }); } catch {}

      // 🚫 Kick si activé et bot admin
      if (data.action === "kick") {
        const botCheck = await checkAdminOrOwner(kaya, m.chat, kaya.user.id);
        if (botCheck.isAdmin) {
          await kaya.groupParticipantsUpdate(m.chat, [m.sender], "remove");
        }
      }

    } catch (err) {
      console.error("❌ ANTITAG DETECT ERROR:", err);
    }
  }
};