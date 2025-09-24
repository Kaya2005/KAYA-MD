// ==================== commands/blockinbox.js ====================
import fs from "fs";
import path from "path";
import config, { saveConfig } from "../config.js";

const configPath = path.join(process.cwd(), "data/config.json");

export default {
  name: "blockinbox",
  description: "Bloque ou débloque les messages privés du bot",
  category: "Owner",
  ownerOnly: true, // le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    try {
      // ✅ Vérification owner centralisée via handler
      if (!context.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Cette commande est réservée au propriétaire du bot." },
          { quoted: m }
        );
      }

      if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Utilisation :\n.blockinbox on\n.blockinbox off" },
          { quoted: m }
        );
      }

      const action = args[0].toLowerCase();

      // Initialise global si nécessaire
      if (!global.blockInbox) global.blockInbox = new Set();

      if (action === "on") {
        global.blockInbox.add("enabled");
        config.blockInbox = true;
        await kaya.sendMessage(
          m.chat,
          { text: "✅ Le bot ne répondra plus en privé aux utilisateurs. Il reste actif dans les groupes." },
          { quoted: m }
        );
      } else {
        global.blockInbox.delete("enabled");
        config.blockInbox = false;
        await kaya.sendMessage(
          m.chat,
          { text: "✅ Le bot peut à nouveau répondre en privé aux utilisateurs." },
          { quoted: m }
        );
      }

      // Sauvegarde config
      if (saveConfig) saveConfig({ blockInbox: config.blockInbox });

    } catch (err) {
      console.error("❌ Erreur blockinbox.js :", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors de la modification du mode BlockInbox." },
        { quoted: m }
      );
    }
  }
};