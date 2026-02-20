import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config, { saveConfig } from "../config.js";

// Pour ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../data/config.json");

// 🔹 Utilitaire : extraire le vrai numéro du JID
function getNumberFromJid(jid) {
  if (!jid) return null;
  const match = jid.match(/^(\d+)@/);
  return match ? match[1] : null;
}

export default {
  name: "sudo",
  description: "👑 Add an owner to the bot",
  category: "Owner",
  ownerOnly: true,

  run: async (kaya, m, args) => {
    try {
      let targetJid = null;

      // 1️⃣ Mention
      if (m.mentionedJid?.length) targetJid = m.mentionedJid[0];

      // 2️⃣ Reply à un message
      else if (m.message?.extendedTextMessage?.contextInfo?.participant)
        targetJid = m.message.extendedTextMessage.contextInfo.participant;

      // 3️⃣ Numéro tapé
      else if (args[0])
        targetJid = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;

      if (!targetJid)
        return kaya.sendMessage(
          m.chat,
          { text: "⚠️ Mention a number, reply to a message, or type a number." },
          { quoted: m }
        );

      // 🔹 Extraire le numéro pur
      const number = getNumberFromJid(targetJid);
      if (!number)
        return kaya.sendMessage(
          m.chat,
          { text: "⚠️ Invalid number." },
          { quoted: m }
        );

      // 🔹 Charger la config existante
      const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (!Array.isArray(data.OWNERS)) data.OWNERS = [];

      // 🔹 Vérifier si déjà owner
      if (data.OWNERS.includes(number)) {
        return kaya.sendMessage(
          m.chat,
          { text: `ℹ️ ${number} is already an owner.` },
          { quoted: m }
        );
      }

      // 🔹 Ajouter le numéro pur
      data.OWNERS.push(number);
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));

      // 🔹 Sauvegarder via saveConfig pour mise à jour globale
      saveConfig({ OWNERS: data.OWNERS });
      global.owner = data.OWNERS;

      // 🔹 Mentionner la personne dans le chat
      const jid = `${number}@s.whatsapp.net`;
      await kaya.sendMessage(
        m.chat,
        { text: `✅ Added as BOT OWNER`, mentions: [jid] },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ sudo error:", err);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Failed to add the owner." },
        { quoted: m }
      );
    }
  }
};