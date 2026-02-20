import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

// 📂 Storage file
const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "antiTagGroups.json");

// Create folder if needed
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ----------------- Load / Save -----------------
function loadData() {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("❌ Error loading antiTagGroups.json:", err);
    return {};
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error saving antiTagGroups.json:", err);
  }
}

// ----------------- Global Init -----------------
global.antiTagGroups ??= loadData();

// ==================== EXPORT ====================
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

      if (!m.isGroup) return kaya.sendMessage(chatId, { text: "❌ This command only works in groups." }, { quoted: m });

      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdminOrOwner) return kaya.sendMessage(chatId, { text: "🚫 Only admins or the owner can use this command." }, { quoted: m });

      // ❌ Show help if no argument
      if (!action) {
        return kaya.sendMessage(chatId, {
          text:
`🚫 *ANTITAG*

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
          text:
`📊 *ANTITAG STATUS*
• State   : ${data?.enabled ? "ON ✅" : "OFF ❌"}
• Action  : ${data?.action || "—"}`
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
        if (!["delete", "kick"].includes(mode)) return kaya.sendMessage(chatId, { text: "⚠️ Usage: .antitag set delete | kick" }, { quoted: m });

        global.antiTagGroups[chatId] = { enabled: true, action: mode };
        saveData(global.antiTagGroups);
        return kaya.sendMessage(chatId, { text: `⚙️ Anti-tag action set to: ${mode.toUpperCase()}` }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ ANTITAG COMMAND ERROR:", err);
      await kaya.sendMessage(m.chat, { text: "❌ Error executing the antitag command." }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const data = global.antiTagGroups?.[m.chat];
      if (!data?.enabled) return;

      const check = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (check.isAdminOrOwner) return;

      const text = m.body || m.caption || "";
      const mentions = m.mentionedJid || [];
      const hasMention = mentions.length > 0 || /@all/i.test(text);

      if (!hasMention) return;

      // 🗑️ Delete the message
      await kaya.sendMessage(m.chat, { delete: m.key }).catch(() => {});

      // 🚫 Kick if enabled
      if (data.action === "kick") {
        await kaya.groupParticipantsUpdate(m.chat, [m.sender], "remove").catch(() => {});
      }

    } catch (err) {
      console.error("❌ ANTITAG DETECT ERROR:", err);
    }
  }
};