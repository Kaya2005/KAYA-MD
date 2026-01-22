// ==================== commands/antispam.js ====================
import fs from "fs";
import path from "path";
import { contextInfo } from "../system/contextInfo.js";
import checkAdminOrOwner from "../system/checkAdmin.js";

const spamFile = path.join(process.cwd(), "data/antiSpamGroups.json");

// ⚙️ CONFIG
const MESSAGE_LIMIT = 6;      // max messages
const TIME_WINDOW = 5000;     // in milliseconds (5 seconds)

// -------- Load / Save --------
function loadData() {
  if (!fs.existsSync(spamFile)) return {};
  return JSON.parse(fs.readFileSync(spamFile, "utf-8"));
}

function saveData(data) {
  fs.writeFileSync(spamFile, JSON.stringify(data, null, 2));
}

// -------- Globals --------
if (!global.antiSpamGroups) global.antiSpamGroups = loadData();
if (!global.spamTracker) global.spamTracker = {};

// ==================== EXPORT ====================
export default {
  name: "antispam",
  description: "Automatic anti-spam (flood protection)",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  // ==================== COMMAND ====================
  run: async (kaya, m, args) => {
    const chatId = m.chat;
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return kaya.sendMessage(
        chatId,
        {
          text: `⚙️ *ANTI-SPAM FLOOD*\n.antispam on  → Enable\n.antispam off → Disable\n\n📨 Limit: ${MESSAGE_LIMIT} messages / ${TIME_WINDOW / 1000}s`,
          contextInfo
        },
        { quoted: m }
      );
    }

    // ✅ Admin/Owner check
    const check = await checkAdminOrOwner(kaya, chatId, m.sender);
    if (!check.isAdminOrOwner) {
      return kaya.sendMessage(
        chatId,
        { text: "🚫 Only Admins or Owner can use this command.", contextInfo },
        { quoted: m }
      );
    }

    if (action === "off") {
      delete global.antiSpamGroups[chatId];
      saveData(global.antiSpamGroups);
      return kaya.sendMessage(chatId, { text: "❌ Anti-spam disabled.", contextInfo }, { quoted: m });
    }

    // 🔒 BOT ADMIN CHECK avant activation
    const groupMetadata = await kaya.groupMetadata(chatId).catch(() => null);
    const botIsAdmin = groupMetadata?.participants.some(
      p => p.jid === kaya.user.jid && p.admin
    );

    if (!botIsAdmin) {
      return kaya.sendMessage(
        chatId,
        { text: "❌ Bot must be admin.", contextInfo },
        { quoted: m }
      );
    }

    // ✅ Activer anti-spam
    global.antiSpamGroups[chatId] = { enabled: true };
    saveData(global.antiSpamGroups);

    return kaya.sendMessage(
      chatId,
      { text: `✅ Anti-spam enabled\n🚨 All spam messages will be automatically deleted\n🚨 Flood detected = AUTOMATIC KICK`, contextInfo },
      { quoted: m }
    );
  },

  // ==================== FLOOD DETECTION ====================
  detect: async (kaya, m) => {
    try {
      const chatId = m.chat;
      const sender = m.sender;

      // 🔒 Check if anti-spam is active
      if (!global.antiSpamGroups?.[chatId]?.enabled) return;

      // 🔒 Skip admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      const now = Date.now();

      if (!global.spamTracker[chatId]) global.spamTracker[chatId] = {};
      if (!global.spamTracker[chatId][sender]) global.spamTracker[chatId][sender] = [];

      const userData = global.spamTracker[chatId][sender];

      // ➕ Add current timestamp
      userData.push(now);

      // 🧹 Remove old timestamps outside window
      global.spamTracker[chatId][sender] = userData.filter(t => now - t <= TIME_WINDOW);

      // 🗑️ Delete current message considered spam
      await kaya.sendMessage(chatId, { delete: m.key }).catch(() => {});

      // 🚨 FLOOD DETECTED
      if (global.spamTracker[chatId][sender].length >= MESSAGE_LIMIT) {
        delete global.spamTracker[chatId][sender];

        // Kick user
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");

        await kaya.sendMessage(
          chatId,
          {
            text: `🚫 @${sender.split("@")[0]} kicked for spamming (flood).`,
            mentions: [sender],
            contextInfo
          }
        );
      }

    } catch (e) {
      console.error("AntiSpam Flood error:", e);
    }
  }
};