import fs from "fs";
import path from "path";
import { getContextInfo } from "../system/contextInfo.js";
import checkAdminOrOwner from "../system/checkAdmin.js";

// 📂 Fichier antiSpam
const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "antiSpamGroups.json");

// ⚙️ CONFIG
const MESSAGE_LIMIT = 6;      // max messages
const TIME_WINDOW = 5000;     // 5 secondes

// Crée le dossier si inexistant
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ----------------- Load / Save -----------------
const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return {};
  }
};

const saveJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// ----------------- Global Init -----------------
global.antiSpamGroups ??= loadJSON(FILE_PATH);
global.spamTracker ??= {};

// ----------------- Save Wrapper -----------------
const saveAntiSpamGroups = () => saveJSON(FILE_PATH, global.antiSpamGroups);

// ==================== EXPORT ====================
export default {
  name: "antispam",
  description: "Automatic anti-spam (flood protection)",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      if (!["on", "off"].includes(action)) {
        return kaya.sendMessage(
          chatId,
          {
            text: `⚙️ *ANTI-SPAM FLOOD*\n.antispam on  → Enable\n.antispam off → Disable\n\n📨 Limit: ${MESSAGE_LIMIT} messages / ${TIME_WINDOW / 1000}s`,
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ✅ Admin/Owner check
      const check = await checkAdminOrOwner(kaya, chatId, m.sender);

      if (!check.isAdminOrOwner) {
        return kaya.sendMessage(
          chatId,
          {
            text: "🚫 Only Admins or Owner can use this command.",
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      if (action === "off") {
        delete global.antiSpamGroups[chatId];
        saveAntiSpamGroups();

        return kaya.sendMessage(
          chatId,
          {
            text: "❌ Anti-spam disabled.",
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // 🔒 Bot admin check avant activation
      const groupMetadata = await kaya.groupMetadata(chatId).catch(() => null);

      const botIsAdmin = groupMetadata?.participants.some(
        p => p.jid === kaya.user.jid && p.admin
      );

      if (!botIsAdmin) {
        return kaya.sendMessage(
          chatId,
          {
            text: "❌ Bot must be admin.",
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ✅ Activer anti-spam
      global.antiSpamGroups[chatId] = { enabled: true };
      saveAntiSpamGroups();

      return kaya.sendMessage(
        chatId,
        {
          text: `✅ Anti-spam enabled\n🚨 Flood detected = AUTOMATIC KICK`,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ antispam.js error:", err);
    }
  },

  detect: async (kaya, m) => {
    try {
      const chatId = m.chat;
      const sender = m.sender;

      if (!global.antiSpamGroups?.[chatId]?.enabled) return;

      // Skip admins/owners
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      const now = Date.now();

      global.spamTracker[chatId] ??= {};
      global.spamTracker[chatId][sender] ??= [];

      // Add current timestamp
      global.spamTracker[chatId][sender].push(now);

      // Remove old timestamps
      global.spamTracker[chatId][sender] =
        global.spamTracker[chatId][sender].filter(
          t => now - t <= TIME_WINDOW
        );

      // 🚨 FLOOD DETECTED
      if (global.spamTracker[chatId][sender].length >= MESSAGE_LIMIT) {
        delete global.spamTracker[chatId][sender];

        // 🗑️ Delete spam message
        await kaya.sendMessage(chatId, {
          delete: m.key
        }).catch(() => {});

        // 👢 Kick user
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");

        await kaya.sendMessage(chatId, {
          text: `🚫 @${sender.split("@")[0]} kicked for spamming (flood).`,
          mentions: [sender],
          contextInfo: getContextInfo()
        });
      }

    } catch (err) {
      console.error("❌ AntiSpam detect error:", err);
    }
  }
};