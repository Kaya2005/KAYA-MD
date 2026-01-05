import fs from "fs";
import path from "path";
import { contextInfo } from "../system/contextInfo.js";

const filePath = path.join(process.cwd(), "data/channelReactions.json");

// Create file if it doesn't exist
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));

// 🔹 Utility functions
function loadChannels() {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function saveChannels(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  global.channelReactionsHistory = data;
}

// 🔹 Global initialization
global.channelReactionsHistory = loadChannels();

export default {
  name: "autoreact-channel",
  description: "⚡ Automatically reacts to a channel post (Owner only)",
  category: "Owner",
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {
      if (!m.fromMe && !m.isOwner) {
        return sock.sendMessage(
          m.chat,
          { text: "❌ Only the owner can use this command." },
          { quoted: m }
        );
      }

      const data = global.channelReactionsHistory;
      let targetKey = null;
      let url = args[0];

      // 🔹 Reply to a message
      if (m.quoted) {
        targetKey = m.quoted.key;
      }

      // 🔹 Channel link
      if (!targetKey && url) {
        const match = url.match(/https?:\/\/(?:chat\.)?whatsapp\.com\/channel\/([A-Za-z0-9]+)\/(\d+)/);
        if (match) {
          const channelId = match[1];
          const messageId = match[2];
          targetKey = {
            remoteJid: `${channelId}@c.us`, // or @g.us if it’s a group
            id: messageId,
            fromMe: false
          };
        }
      }

      if (!targetKey) {
        return sock.sendMessage(
          m.chat,
          { text: "❌ Usage: autoreact-channel [URL of the post or reply to a message containing the link]" },
          { quoted: m }
        );
      }

      // ----------------- Prepare reactions -----------------
      const emojis = ["😄","❤️","🔥","😂","👍"];
      const maxReactions = 50;
      let reactedCount = 0;

      for (let i = 0; i < maxReactions; i++) {
        const emoji = emojis[i % emojis.length];
        try {
          await sock.sendMessage(m.chat, { react: { text: emoji, key: targetKey } });
          reactedCount++;
        } catch (err) {
          console.error("❌ Channel reaction error:", err);
        }
      }

      // ----------------- Save history -----------------
      const keyString = targetKey.id ? `${targetKey.remoteJid}_${targetKey.id}` : null;
      if (keyString) {
        data[keyString] = { reactedCount, lastReact: new Date().toISOString() };
        saveChannels(data);
      }

      return sock.sendMessage(
        m.chat,
        { text: `✅ Reactions sent: ${reactedCount} emoji(s) on the post!`, contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ autoreact-channel error:", err);
      return sock.sendMessage(m.chat, { text: "❌ An error occurred." }, { quoted: m });
    }
  }
};