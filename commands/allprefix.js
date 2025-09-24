// ==================== commands/allprefix.js ====================
import fs from "fs";
import path from "path";
import { contextInfo } from "../utils/contextInfo.js";
import config, { saveConfig } from "../config.js";

const filePath = path.join(process.cwd(), "data/allPrefix.json");


if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({ enabled: false }, null, 2));
}


function loadAllPrefix() {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data.enabled || false;
  } catch {
    return false;
  }
}


function saveAllPrefix(state) {
  fs.writeFileSync(filePath, JSON.stringify({ enabled: state }, null, 2));
  global.allPrefix = state;
  console.log("🌐 Mode AllPrefix :", state ? "Activé" : "Désactivé");
}


global.allPrefix = loadAllPrefix();

export default {
  name: "allprefix",
  description: "⚙️ Active ou désactive le mode n'importe quel préfixe",
  category: "Bot",
  ownerOnly: true, // le handler bloquera les non-owners
  run: async (kaya, m, msg, store, args, context) => {
    try {
      // ✅ Vérification owner centralisée via handler
      if (!context.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seul le *propriétaire* peut activer/désactiver le mode AllPrefix.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();
      if (!action || !["on", "off"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Mode AllPrefix : activez ou désactivez\n- .allprefix on\n- .allprefix off", contextInfo },
          { quoted: m }
        );
      }

      if (action === "on") {
        saveAllPrefix(true);
        return kaya.sendMessage(
          m.chat,
          { text: "✅ Mode *AllPrefix activé* : le bot accepte n'importe quel préfixe ou sans préfixe.", contextInfo },
          { quoted: m }
        );
      } else {
        saveAllPrefix(false);
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Mode *AllPrefix désactivé* : le bot fonctionne seulement avec le préfixe défini.", contextInfo },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("❌ Erreur allprefix.js:", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors de l'activation du mode AllPrefix.", contextInfo },
        { quoted: m }
      );
    }
  }
};