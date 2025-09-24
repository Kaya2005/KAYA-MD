// ==================== commands/botmode.js ====================
import fs from "fs";
import path from "path";
import { contextInfo } from "../utils/contextInfo.js";
import config, { saveConfig } from "../config.js";

const filePath = path.join(process.cwd(), "data/botMode.json");

// Crée le fichier JSON s'il n'existe pas
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({ mode: "public" }, null, 2));
}

// Fonction pour lire le JSON
function loadBotMode() {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data.mode || "public";
  } catch {
    return "public";
  }
}

// Fonction pour sauvegarder le JSON
function saveBotMode(mode) {
  fs.writeFileSync(filePath, JSON.stringify({ mode }, null, 2));
  global.botMode = mode;
  console.log("🤖 Mode Bot :", mode);
}

// Initialise global.botMode
global.botMode = loadBotMode();

export default {
  name: "botmode",
  description: "⚙️ Configure le mode du bot (public/privé)",
  category: "Owner",
  ownerOnly: true, // ✅ handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    try {
      if (!context.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Cette commande est réservée au propriétaire du bot.", contextInfo },
          { quoted: m }
        );
      }

      // Si aucune option → on affiche l'aide
      if (!args[0]) {
        return kaya.sendMessage(
          m.chat,
          {
            text: `⚙️ Utilisation du mode bot :\n\n- *.public on* → Active le mode public\n- *.private on* → Active le mode privé\n\n📌 Mode actuel : *${global.botMode.toUpperCase()}*`,
            contextInfo
          },
          { quoted: m }
        );
      }

      const action = args[0].toLowerCase();
      const command = m.body.split(" ")[0].replace(config.PREFIX, "").toLowerCase();

      if (command === "public" && action === "on") {
        saveBotMode("public");
        if (saveConfig) saveConfig({ botMode: "public" });
        return kaya.sendMessage(
          m.chat,
          { text: "✅ Mode bot changé : *PUBLIC*", contextInfo },
          { quoted: m }
        );
      }

      if ((command === "private" || command === "privé") && action === "on") {
        saveBotMode("privé");
        if (saveConfig) saveConfig({ botMode: "privé" });
        return kaya.sendMessage(
          m.chat,
          { text: "✅ Mode bot changé : *PRIVÉ*", contextInfo },
          { quoted: m }
        );
      }

      return kaya.sendMessage(
        m.chat,
        {
          text: "❌ Mauvaise utilisation.\n\n⚙️ Utilisation correcte :\n- *.public on*\n- *.private on*",
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Erreur botmode.js:", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors du changement de mode bot.", contextInfo },
        { quoted: m }
      );
    }
  }
};