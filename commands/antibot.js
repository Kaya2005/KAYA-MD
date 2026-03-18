import { BOT_NAME } from "../system/botAssets.js";
import checkAdminOrOwner from "../system/checkAdmin.js";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ANTIBOT_FILE = path.join(DATA_DIR, "antibot.json");
const BOTWARNS_FILE = path.join(DATA_DIR, "botWarns.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch { return {}; }
};

const saveJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

global.antiBotGroups ??= loadJSON(ANTIBOT_FILE);
global.botWarns ??= loadJSON(BOTWARNS_FILE);

const saveAntiBotGroups = () => saveJSON(ANTIBOT_FILE, global.antiBotGroups);
const saveBotWarns = () => saveJSON(BOTWARNS_FILE, global.botWarns);

// 🔹 Patterns noms bots (tu peux compléter si besoin)
const botPatterns = [
  /^3EB0/, /^4EB0/, /^5EB0/, /^6EB0/, /^7EB0/, /^8EB0/,
  /^9EB0/, /^AEB0/, /^BEB0/, /^CEB0/, /^DEB0/, /^EEB0/,
  /^FEB0/, /^BAE5/, /^BAE7/, /^CAEB0/, /^DAEB0/, /^EAEB0/,
  /^FAEB0/
];

export default {
  name: "antibot",
  description: "Anti-bot protection (delete, warn, kick)",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      if (!action || !["on","off","delete","warn","kick","status"].includes(action)) {
        return kaya.sendMessage(chatId, { text:
`${BOT_NAME} Anti-Bot Command

.antibot on      → Enable (WARN mode)
.antibot off     → Disable
.antibot delete  → Auto delete bot messages
.antibot warn    → 3 warnings = kick
.antibot kick    → Instant kick
.antibot status  → Show status`}, { quoted: m });
      }

      // Vérification admin
      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdminOrOwner) return kaya.sendMessage(chatId, { text: "🚫 Admins only." }, { quoted: m });

      if (action === "status") {
        const data = global.antiBotGroups[chatId];
        return kaya.sendMessage(chatId, { text: data?.enabled
          ? `✅ Anti-bot ENABLED\n📊 Mode: ${data.mode.toUpperCase()}`
          : "❌ Anti-bot is disabled."}, { quoted: m });
      }

      if (action === "on") global.antiBotGroups[chatId] = { enabled: true, mode: "warn" };
      else if (["delete","warn","kick"].includes(action)) global.antiBotGroups[chatId] = { enabled: true, mode: action };
      else if (action === "off") {
        delete global.antiBotGroups[chatId];
        delete global.botWarns[chatId];
      }

      saveAntiBotGroups();
      saveBotWarns();

      return kaya.sendMessage(chatId, { text:
        action === "off"
          ? "❌ Anti-bot disabled."
          : `✅ Anti-bot ${action === "on" ? "enabled (WARN mode)" : "mode set to " + action.toUpperCase()}` 
      }, { quoted: m });

    } catch (err) {
      console.error("❌ antibot.js error:", err);
      kaya.sendMessage(m.chat, { text: "❌ Anti-bot error." }, { quoted: m });
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const chatId = m.chat;
      const sender = m.sender;
      const data = global.antiBotGroups[chatId];
      if (!data?.enabled) return; // only enabled groups

      // Vérifie que l'utilisateur n'est pas admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      // Vérifie que le bot est admin
      const meta = await kaya.groupMetadata(chatId);
      const botId = `${kaya.user.id}@s.whatsapp.net`;
      const bot = meta.participants.find(p => p.id === botId);
      if (!bot?.admin) return;

      // 🔹 Détection des bots
      const now = Date.now();
      global.messageRate ??= {};
      global.messageRate[sender] ??= [];
      global.messageRate[sender].push(now);
      global.messageRate[sender] = global.messageRate[sender].filter(t => now - t < 5000);

      const isBotSpam = global.messageRate[sender].length >= 6 || m.message?.protocolMessage || m.message?.reactionMessage;
      const isBotName = botPatterns.some(p => p.test(m.pushName || ''));

      if (!isBotSpam && !isBotName) return;

      // Supprime le message
      try { await kaya.sendMessage(chatId, { delete: m.key }); } catch {}

      // Action selon mode
      const mode = data.mode;
      if (mode === "kick") return kaya.groupParticipantsUpdate(chatId, [sender], "remove");
      if (mode === "warn") {
        global.botWarns[chatId] ??= {};
        global.botWarns[chatId][sender] = (global.botWarns[chatId][sender] || 0) + 1;
        saveBotWarns();
        if (global.botWarns[chatId][sender] >= 3) {
          delete global.botWarns[chatId][sender];
          saveBotWarns();
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        }
      }
      // mode delete = rien d’autre à faire

    } catch (err) {
      console.error("❌ AntiBot detect error:", err);
    }
  }
};