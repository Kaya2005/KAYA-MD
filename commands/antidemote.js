// commands/antidemote.js
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../utils/checkAdmin.js";
import { contextInfo } from "../utils/contextInfo.js";

const antiDemoteFile = path.join(process.cwd(), "data/antidemote.json");


let antiDemoteData = {};
try {
  antiDemoteData = JSON.parse(fs.readFileSync(antiDemoteFile, "utf-8"));
} catch {
  antiDemoteData = {};
  fs.writeFileSync(antiDemoteFile, "{}");
}

function saveAntiDemote() {
  fs.writeFileSync(antiDemoteFile, JSON.stringify(antiDemoteData, null, 2));
}


const processing = new Set();

export default {
  name: "antidemote",
  description: "🚫 Empêche de retirer les admins (re-nomme automatiquement)",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

      if (!permissions.isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: "🚫 Seuls les admins ou owners peuvent utiliser cette commande.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();
      if (!action || !["on", "off"].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Utilisation : .antidemote on / off", contextInfo },
          { quoted: m }
        );
      }

      if (action === "on") {
        antiDemoteData[m.chat] = true;
        saveAntiDemote();
        return kaya.sendMessage(
          m.chat,
          { text: "✅ *AntiDemote activé* : les admins seront automatiquement re-promus si on les retire.", contextInfo },
          { quoted: m }
        );
      } else {
        delete antiDemoteData[m.chat];
        saveAntiDemote();
        return kaya.sendMessage(
          m.chat,
          { text: "❌ *AntiDemote désactivé* pour ce groupe.", contextInfo },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error("Erreur antidemote.js :", err);
    }
  },

  participantUpdate: async (kaya, update) => {
    try {
      const { id: chatId, participants, action, byBot } = update;
      if (!antiDemoteData[chatId]) return;
      if (action !== "demote") return;
      if (byBot) return; 

      for (const user of participants) {
        if (processing.has(user)) continue;

        processing.add(user);
        try {
          await kaya.groupParticipantsUpdate(chatId, [user], "promote", { byBot: true });
          await kaya.sendMessage(chatId, {
            text: `⚠️ *AntiDemote actif*\n@${user.split("@")[0]} a été re-promu automatiquement.`,
            mentions: [user],
            contextInfo
          });
        } catch (e) {
          console.error("Erreur antiDemote participantUpdate:", e);
        } finally {
          setTimeout(() => processing.delete(user), 2000);
        }
      }
    } catch (err) {
      console.error("Erreur antiDemote global:", err);
    }
  }
};