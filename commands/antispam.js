// ================= commands/antispam.js =================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js";

const antiSpamFile = path.join(process.cwd(), "data/antiSpamGroups.json");

// ----------------- Load & Save -----------------
function loadAntiSpamGroups() {
  if (!fs.existsSync(antiSpamFile)) return new Set();
  try {
    const groups = JSON.parse(fs.readFileSync(antiSpamFile, "utf-8"));
    return new Set(groups);
  } catch {
    return new Set();
  }
}

function saveAntiSpamGroups(groups) {
  fs.writeFileSync(antiSpamFile, JSON.stringify([...groups], null, 2));
}

// ----------------- Global -----------------
if (!global.antiSpamGroups) global.antiSpamGroups = loadAntiSpamGroups();

// ----------------- State in-memory -----------------
const userMessages = new Map(); // sender => [{ timestamp, key }]
const lastKick = new Map();     // sender => timestamp of last kick

const SPAM_LIMIT = 7;       // nombre de messages pour considérer spam
const TIME_FRAME = 10_000;  // fenêtre temporelle en ms (10s)
const DELETE_LAST = 20;     // nombre max de messages à supprimer

export default {
  name: "antispam",
  description: "Active ou désactive l’anti-spam dans un groupe",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  // ----------------- Commande -----------------
  run: async (kaya, m, msg, store, args) => {
    try {
      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      if (!m.isGroup) {
        return kaya.sendMessage(chatId, { text: "❌ Cette commande fonctionne uniquement dans un groupe.", contextInfo }, { quoted: m });
      }

      const permissions = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!permissions.isAdminOrOwner) {
        return kaya.sendMessage(chatId, { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’anti-spam.", contextInfo }, { quoted: m });
      }

      if (!action || !["on", "off"].includes(action)) {
        return kaya.sendMessage(chatId, {
          text: "⚙️ Anti-spam : activez ou désactivez\n- .antispam on\n- .antispam off"
        }, { quoted: m });
      }

      const antiSpamGroups = new Set(global.antiSpamGroups);

      if (action === "on") {
        antiSpamGroups.add(chatId);
        global.antiSpamGroups = antiSpamGroups;
        saveAntiSpamGroups(antiSpamGroups);
        return kaya.sendMessage(chatId, { text: `✅ *Anti-spam activé*\n- ${SPAM_LIMIT}+ msgs en ${TIME_FRAME / 1000}s = kick 🚫`, contextInfo }, { quoted: m });
      } else {
        antiSpamGroups.delete(chatId);
        global.antiSpamGroups = antiSpamGroups;
        saveAntiSpamGroups(antiSpamGroups);
        return kaya.sendMessage(chatId, { text: "❌ *Anti-spam désactivé* pour ce groupe.", contextInfo }, { quoted: m });
      }

    } catch (err) {
      console.error("Erreur antispam.js (run):", err);
    }
  },

  // ----------------- Détection -----------------
  detect: async (kaya, m) => {
    try {
      const chatId = m.chat;
      const sender = m.sender;
      if (!global.antiSpamGroups?.has(chatId)) return;
      if (m.key?.fromMe) return; // Ignore bot

      // Initialisation mémoire
      if (!userMessages.has(sender)) userMessages.set(sender, []);
      const now = Date.now();

      let records = (userMessages.get(sender) || []).filter(r => now - r.timestamp < TIME_FRAME);

      if (m.key?.id) {
        records.push({ timestamp: now, key: m.key });
      }

      userMessages.set(sender, records);

      if (records.length >= SPAM_LIMIT) {
        const last = lastKick.get(sender) || 0;
        if (now - last < 10_000) return; // cooldown pour éviter kick multiple

        lastKick.set(sender, now);

        // Supprime les derniers messages spam
        const toDelete = records.slice(-DELETE_LAST);
        for (const r of toDelete) {
          try { await kaya.sendMessage(chatId, { delete: r.key }); } catch {}
        }

        // Expulsion du spammeur
        try { await kaya.groupParticipantsUpdate(chatId, [sender], "remove"); } catch {}

        try {
          await kaya.sendMessage(chatId, {
            text: `🚫 *@${sender.split("@")[0]}* expulsé pour *SPAM* (${SPAM_LIMIT}+ msgs en ${Math.round(TIME_FRAME / 1000)}s).`,
            mentions: [sender],
            contextInfo
          });
        } catch (err) { console.error(err); }

        userMessages.delete(sender); // reset historique
      }

    } catch (err) {
      console.error("Erreur anti-spam detect:", err);
    }
  }
};