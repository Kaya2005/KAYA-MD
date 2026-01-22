import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";
import decodeJid from "../system/decodeJid.js";
import { contextInfo } from "../system/contextInfo.js";
import { buildByeMessage } from "../system/byeTemplate.js";

const BYE_FILE = path.join(process.cwd(), "data/bye.json");
let byeData = {};

// Charger ou créer le fichier
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
  description: "Active ou désactive le message d’au revoir dans les groupes",
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
      const groupPP = await kaya
        .profilePictureUrl(chatId, "image")
        .catch(() => "https://i.imgur.com/3XjWdoI.png");

      if (subCmd === "on" || subCmd === "1") {
        byeData[chatId] = true;
        saveByeData();
        return kaya.sendMessage(
          chatId,
          {
            image: { url: groupPP },
            caption: "✅ *BYE ACTIVÉ* pour ce groupe !",
            contextInfo
          },
          { quoted: m }
        );
      }

      if (subCmd === "off" || subCmd === "0") {
        delete byeData[chatId];
        saveByeData();
        return kaya.sendMessage(
          chatId,
          {
            image: { url: groupPP },
            caption: "❌ *BYE DÉSACTIVÉ* pour ce groupe.",
            contextInfo
          },
          { quoted: m }
        );
      }

      if (subCmd === "all") {
        byeData.global = true;
        saveByeData();
        return kaya.sendMessage(
          chatId,
          { text: "✅ BYE global activé.", contextInfo },
          { quoted: m }
        );
      }

      if (subCmd === "alloff") {
        delete byeData.global;
        saveByeData();
        return kaya.sendMessage(
          chatId,
          { text: "❌ BYE global désactivé.", contextInfo },
          { quoted: m }
        );
      }

      if (subCmd === "status") {
        const globalStatus = byeData.global
          ? "✅ Activé globalement"
          : "❌ Désactivé globalement";
        const groupStatus = byeData[chatId]
          ? "✅ Activé ici"
          : "❌ Désactivé ici";

        return kaya.sendMessage(
          chatId,
          {
            text: `📊 *STATUT BYE*\n\n${globalStatus}\n${groupStatus}`,
            contextInfo
          },
          { quoted: m }
        );
      }

      return kaya.sendMessage(
        chatId,
        {
          text:
            "❓ Utilisation :\n" +
            "• `.bye on` / `.bye off`\n" +
            "• `.bye all` / `.bye alloff`\n" +
            "• `.bye status`",
          contextInfo
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ Erreur bye run :", err);
      return kaya.sendMessage(
        m.chat,
        { text: `❌ Erreur bye : ${err.message}`, contextInfo },
        { quoted: m }
      );
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
          const userJid =
            typeof user === "string" ? user : decodeJid(user.id || user);
          const username = "@" + userJid.split("@")[0];

          const userPP = await kaya
            .profilePictureUrl(userJid, "image")
            .catch(() => null);

          const groupPP = await kaya
            .profilePictureUrl(chatId, "image")
            .catch(() => "https://i.imgur.com/3XjWdoI.png");

          const byeText = buildByeMessage({
            username,
            groupName: metadata.subject || "Nom inconnu",
            membersCount: metadata.participants.length
          });

          await kaya.sendMessage(chatId, {
            image: { url: userPP || groupPP },
            caption: byeText,
            mentions: [userJid],
            contextInfo: { ...contextInfo, mentionedJid: [userJid] }
          });
        } catch (err) {
          console.error("❌ Erreur bye participant :", err);
        }
      }
    } catch (err) {
      console.error("❌ Erreur bye participantUpdate :", err);
    }
  }
};