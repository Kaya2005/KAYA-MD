import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config, { saveConfig } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "../data/config.json");

export default {
  name: "sudo",
  description: "👑 Add an owner to the bot",
  category: "Owner",
  ownerOnly: true,

  run: async (kaya, m, args) => {
    try {
      // ================== GET TARGET ==================
      let target = null;

      // Mention
      if (m.mentionedJid?.length) target = m.mentionedJid[0];
      // Reply
      else if (m.message?.extendedTextMessage?.contextInfo?.participant) target = m.message.extendedTextMessage.contextInfo.participant;
      // Written number
      else if (args[0]) target = args[0];

      if (!target) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚠️ Mention a number, reply to a message, or type a number." },
          { quoted: m }
        );
      }

      // ================== CLEAN NUMBER ==================
      // Keep only digits
      const number = target.replace(/\D/g, "");

      if (!number) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚠️ Invalid number." },
          { quoted: m }
        );
      }

      // ================== LOAD CONFIG ==================
      const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      // 🔁 Ensure OWNERS is an array
      if (!Array.isArray(data.OWNERS)) data.OWNERS = [];

      // ================== ALREADY OWNER? ==================
      if (data.OWNERS.includes(number)) {
        return kaya.sendMessage(
          m.chat,
          { text: `ℹ️ ${number} is already an owner.` },
          { quoted: m }
        );
      }

      // ================== ADD OWNER ==================
      data.OWNERS.push(number);

      // Save config
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
      saveConfig({ OWNERS: data.OWNERS });

      // Update global variable
      global.owner = data.OWNERS;

      // ================== CONFIRMATION ==================
      await kaya.sendMessage(
        m.chat,
        { text: `✅ ${number} is now a *BOT OWNER*.` },
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