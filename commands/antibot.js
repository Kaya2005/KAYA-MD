// ================= commands/antibot.js =================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js";

const antibotFile = path.join(process.cwd(), "data/antibotGroups.json");

// ----------------- Load & Save -----------------
function loadAntibotGroups() {
  if (!fs.existsSync(antibotFile)) return new Set();
  try {
    const groups = JSON.parse(fs.readFileSync(antibotFile, "utf-8"));
    return new Set(groups);
  } catch {
    return new Set();
  }
}

function saveAntibotGroups(groups) {
  fs.writeFileSync(antibotFile, JSON.stringify([...groups], null, 2));
}

// ----------------- Global -----------------
if (!global.antibotGroups) global.antibotGroups = loadAntibotGroups();

export default {
  name: "antibot",
  description: "Active ou désactive la protection contre les bots dans le groupe",
  category: "Groupe",
  group: true,
  admin: true,

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
        return kaya.sendMessage(chatId, { text: "🚫 Seuls les *Admins* ou le *Propriétaire* peuvent activer/désactiver l’antibot.", contextInfo }, { quoted: m });
      }

      if (!action || !["on", "off"].includes(action)) {
        return kaya.sendMessage(chatId, { text: "⚙️ Usage: `.antibot on` ou `.antibot off`", contextInfo }, { quoted: m });
      }

      const antibotGroups = new Set(global.antibotGroups);

      if (action === "on") {
        antibotGroups.add(chatId);
        global.antibotGroups = antibotGroups;
        saveAntibotGroups(antibotGroups);

        return kaya.sendMessage(chatId, { text: "✅ *Antibot activé* : les messages automatiques des bots seront supprimés.", contextInfo }, { quoted: m });
      } else {
        antibotGroups.delete(chatId);
        global.antibotGroups = antibotGroups;
        saveAntibotGroups(antibotGroups);

        return kaya.sendMessage(chatId, { text: "❌ *Antibot désactivé* dans ce groupe.", contextInfo }, { quoted: m });
      }
    } catch (err) {
      console.error("Erreur antibot.js (run):", err);
    }
  },

  // ----------------- Détection automatique -----------------
  detect: async (kaya, m) => {
    try {
      const chatId = m.chat;
      if (!global.antibotGroups?.has(chatId)) return;

      const sender = m.sender;
      const body = m.text || m.message?.conversation || "";

      
      if (sender === kaya.user?.id) return;

      
      const metadata = await kaya.groupMetadata(chatId);
      const admins = metadata.participants
        .filter(p => p.admin || p.role === "admin" || p.role === "superadmin")
        .map(p => p.id.toLowerCase());

      if (admins.includes(sender.toLowerCase())) return;

      
      if (body && body.length > 0) {
        await kaya.sendMessage(chatId, { delete: m.key });
        console.log(`🚫 Message bot supprimé dans ${chatId}: ${body.substring(0, 30)}...`);
      }

    } catch (err) {
      console.error("Erreur antibot detect:", err);
    }
  }
};