import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";
import decodeJid from "../system/decodeJid.js";
import { contextInfo } from "../system/contextInfo.js";

const BYE_FILE = path.join(process.cwd(), "data/bye.json");
let byeData = {};

// Load or create file
try {
  byeData = JSON.parse(fs.readFileSync(BYE_FILE, "utf-8"));
} catch {
  byeData = {};
  fs.writeFileSync(BYE_FILE, JSON.stringify({}, null, 2));
}

function saveByeData() {
  fs.writeFileSync(BYE_FILE, JSON.stringify(byeData, null, 2));
}

export default {
  name: "bye",
  description: "Enable/disable goodbye messages in groups",
  category: "Groupe",
  group: true,
  admin: true,
  ownerOnly: false,

  run: async (kaya, m, args) => {
    try {
      const chatId = decodeJid(m.chat);
      const sender = decodeJid(m.sender);
      const permissions = await checkAdminOrOwner(kaya, chatId, sender);
      if (!permissions.isAdmin && !permissions.isOwner) return;

      const subCmd = args[0]?.toLowerCase();
      const groupPP = await kaya.profilePictureUrl(chatId, "image").catch(() => "https://i.imgur.com/3XjWdoI.png");

      if (subCmd === "on" || subCmd === "1") {
        byeData[chatId] = true;
        saveByeData();
        return kaya.sendMessage(chatId, { 
          image: { url: groupPP }, 
          caption: "✅ *BYE ENABLED* for this group!",
          contextInfo
        }, { quoted: m });
      }

      if (subCmd === "off" || subCmd === "0") {
        delete byeData[chatId];
        saveByeData();
        return kaya.sendMessage(chatId, { 
          image: { url: groupPP }, 
          caption: "❌ *BYE DISABLED* for this group.",
          contextInfo
        }, { quoted: m });
      }

      if (subCmd === "all") {
        byeData.global = true;
        saveByeData();
        return kaya.sendMessage(chatId, { text: "✅ Global BYE enabled.", contextInfo }, { quoted: m });
      }

      if (subCmd === "alloff") {
        delete byeData.global;
        saveByeData();
        return kaya.sendMessage(chatId, { text: "❌ Global BYE disabled.", contextInfo }, { quoted: m });
      }

      if (subCmd === "status") {
        const globalStatus = byeData.global ? "✅ Enabled globally" : "❌ Disabled globally";
        const groupStatus = byeData[chatId] ? "✅ Enabled here" : "❌ Disabled here";
        return kaya.sendMessage(chatId, { text: `📊 *BYE STATUS*\n\n${globalStatus}\n${groupStatus}`, contextInfo }, { quoted: m });
      }

      return kaya.sendMessage(chatId, {
        text: "❓ Use `.bye on` or `.bye off`. For global: `.bye all` / `.bye alloff`",
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error("❌ bye run error:", err);
      return kaya.sendMessage(m.chat, { text: `❌ Bye error: ${err.message}`, contextInfo }, { quoted: m });
    }
  },

  participantUpdate: async (kaya, update) => {
    try {
      const chatId = decodeJid(update.id);
      const { participants, action } = update;

      if (action !== "remove") return;
      if (!byeData.global && !byeData[chatId]) return;

      const metadata = await kaya.groupMetadata(chatId).catch(() => null);
      if (!metadata) return;

      for (const user of participants) {
        try {
          const userJid = typeof user === "string" ? user : decodeJid(user.id || user);
          const username = "@" + userJid.split("@")[0];

          const userPP = await kaya.profilePictureUrl(userJid, "image").catch(() => null);
          const groupPP = await kaya.profilePictureUrl(chatId, "image").catch(() => "https://i.imgur.com/3XjWdoI.png");

          const byeText = `╭━━〔 KAYA-MD 〕━━⬣
├ 👋 Goodbye ${username}
├ 🎓 Group: *${metadata.subject || "Unknown"}*
├ 👥 Remaining members: ${metadata.participants.length}
╰─────────────────────⬣`;

          await kaya.sendMessage(chatId, {
            image: { url: userPP || groupPP },
            caption: byeText,
            mentions: [userJid],
            contextInfo: { ...contextInfo, mentionedJid: [userJid] }
          });

        } catch (err) {
          console.error("❌ bye participant error:", err);
        }
      }

    } catch (err) {
      console.error("❌ bye participantUpdate error:", err);
    }
  }
};