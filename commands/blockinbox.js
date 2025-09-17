// ==================== commands/blockinbox.js ====================
import fs from "fs";
import path from "path";
import config from "../config.js";
import checkAdminOrOwner from "../utils/checkAdmin.js";

const configPath = path.join(process.cwd(), "data/config.json");

export default {
  name: "blockinbox",
  description: "Bloque ou débloque les messages privés du bot",
  category: "Owner",

  run: async (kaya, m, msg, store, args) => {
    // ✅ Vérifie si l'utilisateur est owner
    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

    if (!permissions.isOwner) {
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

    // Charge config existante
    let userConfig = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {};

    if (action === "on") {
      global.blockInbox.add("enabled");
      userConfig.blockInbox = true;
      await kaya.sendMessage(
        m.chat,
        { text: "✅ Le bot ne répondra plus en privé aux utilisateurs. Il reste actif dans les groupes." },
        { quoted: m }
      );
    } else {
      global.blockInbox.delete("enabled");
      userConfig.blockInbox = false;
      await kaya.sendMessage(
        m.chat,
        { text: "✅ Le bot peut à nouveau répondre en privé aux utilisateurs." },
        { quoted: m }
      );
    }

    // Sauvegarde config
    fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));
    if (config.saveConfig) config.saveConfig(userConfig);
  }
};