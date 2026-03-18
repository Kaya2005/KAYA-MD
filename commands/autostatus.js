import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";
import { contextInfo } from "../system/contextInfo.js";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "autoStatus.json");

// Crée le dossier si inexistant
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Charge ou initialise la config
global.autoStatusConfig ??= fs.existsSync(FILE_PATH)
  ? JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"))
  : { enabled: false, reactOn: false };

const saveConfig = () => fs.writeFileSync(FILE_PATH, JSON.stringify(global.autoStatusConfig, null, 2));

export default {
  name: "autostatus",
  description: "Auto view & react to WhatsApp statuses",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: false,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      const sender = m.sender;

      // ✅ Vérifie si admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (!check.isAdminOrOwner) 
        return kaya.sendMessage(chatId, { text: "🚫 Only Admins or Owner can use this command.", contextInfo }, { quoted: m });

      const action = args[0]?.toLowerCase();

      // 🔹 Si pas d'argument, afficher le status actuel
      if (!action) {
        return kaya.sendMessage(chatId, {
          text: `🔄 *Auto Status Settings*\n\n📱 Auto Status View: ${global.autoStatusConfig.enabled ? "✅ Enabled" : "❌ Disabled"}\n💫 Status Reactions: ${global.autoStatusConfig.reactOn ? "✅ Enabled" : "❌ Disabled"}\n\nCommands:\n.autostatus on/off\n.autostatus react on/off`,
          contextInfo
        }, { quoted: m });
      }

      // 🔹 Activer/Désactiver lecture auto
      if (action === "on" || action === "off") {
        global.autoStatusConfig.enabled = action === "on";
        saveConfig();
        return kaya.sendMessage(chatId, { text: `${action === "on" ? "✅" : "❌"} Auto status view ${action === "on" ? "enabled" : "disabled"}!`, contextInfo }, { quoted: m });
      }

      // 🔹 Activer/Désactiver réactions
      if (action === "react") {
        const reactCmd = args[1]?.toLowerCase();
        if (!["on","off"].includes(reactCmd))
          return kaya.sendMessage(chatId, { text: "❌ Specify .autostatus react on/off", contextInfo }, { quoted: m });

        global.autoStatusConfig.reactOn = reactCmd === "on";
        saveConfig();
        return kaya.sendMessage(chatId, { text: `💫 Status reactions ${reactCmd === "on" ? "enabled" : "disabled"}!`, contextInfo }, { quoted: m });
      }

      return kaya.sendMessage(chatId, { text: "❌ Invalid command! Use .autostatus on/off or .autostatus react on/off", contextInfo }, { quoted: m });

    } catch (err) {
      console.error("❌ autostatus.js error:", err);
    }
  },

  // 🔹 Détecte et gère la lecture + réaction auto
  detect: async (kaya, status) => {
    try {
      if (!global.autoStatusConfig?.enabled) return;

      const key = status.key;
      if (!key || key.remoteJid !== "status@broadcast") return;

      // Lire le statut
      await kaya.readMessages([key]);

      // Réagir si activé
      if (global.autoStatusConfig.reactOn) {
        await kaya.relayMessage(
          "status@broadcast",
          { reactionMessage: { key, text: "💚" } },
          { messageId: key.id }
        ).catch(() => {});
      }

    } catch (err) {
      console.error("❌ Error in autostatus detect:", err);
    }
  }
};