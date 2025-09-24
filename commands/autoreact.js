// ================= commands/autoreact.js =================
import { saveBotModes } from "../utils/botModes.js";
import { contextInfo } from "../utils/contextInfo.js";

export default {
  name: "autoreact",
  description: "Active/Désactive le mode réaction automatique ❤️ (owner uniquement)",
  category: "Owner",
  ownerOnly: true, // le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    try {
      // ✅ Vérification owner centralisée via handler
      if (!context.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Commande réservée au propriétaire.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();
      if (!["on", "off"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚙️ Usage : `.autoreact on` ou `.autoreact off`", contextInfo },
          { quoted: m }
        );
      }

      global.botModes.autoreact = action === "on";
      saveBotModes(global.botModes);

      return kaya.sendMessage(
        m.chat,
        {
          text: global.botModes.autoreact
            ? "❤️ Mode *AutoReact* activé ! Le bot réagira automatiquement."
            : "❌ Mode *AutoReact* désactivé.",
          contextInfo,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ Erreur autoreact.js :", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors du changement du mode.", contextInfo },
        { quoted: m }
      );
    }
  },
};