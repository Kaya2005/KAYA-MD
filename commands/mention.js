import fs from "fs";
import path from "path";

const filePath = "./database/mention.json";

// 📂 Lire la réponse enregistrée
function getMention() {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath));
}

// 💾 Enregistrer la réponse
function setMention(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ❌ Supprimer
function deleteMention() {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export default {
  name: "mention",
  alias: ["autoreply"],
  category: "groupe",
  ownerOnly: true,
  usage: ".mention set / get / del",

  run: async (kaya, m, args) => {
    try {
      const action = args[0]?.toLowerCase();

      if (!action) {
        return kaya.sendMessage(
          m.chat,
          {
            text:
              `📌 *Mention System*\n\n` +
              `• *.mention set* (reply message)\n` +
              `• *.mention get*\n` +
              `• *.mention del*`
          },
          { quoted: m }
        );
      }

      // 📌 SET
      if (action === "set") {
        if (!m.quoted) {
          return kaya.sendMessage(
            m.chat,
            { text: "❌ Reply to a message to save it." },
            { quoted: m }
          );
        }

        const msg = m.quoted.text || m.quoted.caption;

        if (!msg) {
          return kaya.sendMessage(
            m.chat,
            { text: "❌ Only text messages supported." },
            { quoted: m }
          );
        }

        setMention({
          text: msg,
          time: Date.now(),
        });

        return kaya.sendMessage(
          m.chat,
          { text: "✅ Mention reply saved successfully." },
          { quoted: m }
        );
      }

      // 📌 GET
      if (action === "get") {
        const data = getMention();

        if (!data) {
          return kaya.sendMessage(
            m.chat,
            { text: "❌ No mention reply saved." },
            { quoted: m }
          );
        }

        return kaya.sendMessage(
          m.chat,
          {
            text:
              `📌 *Current Mention Reply*\n\n` +
              `${data.text}\n\n` +
              `📅 ${new Date(data.time).toLocaleString()}`
          },
          { quoted: m }
        );
      }

      // 📌 DELETE
      if (action === "del") {
        deleteMention();

        return kaya.sendMessage(
          m.chat,
          { text: "🗑 Mention reply deleted." },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error(err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Error in mention command." },
        { quoted: m }
      );
    }
  }
};