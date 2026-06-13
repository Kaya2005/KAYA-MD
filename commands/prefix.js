import config, { saveConfig } from "../config.js";
import { getContextInfo } from "../system/contextInfo.js";

export default {
  name: "prefix",
  description: "Change or display bot prefix",
  category: "Owner",
  ownerOnly: true,

  async execute(sock, m, args) {
    try {

      /* ================= SHOW PREFIX ================= */
      if (!args[0]) {
        return sock.sendMessage(
          m.chat,
          {
            text: `
🔧 *CURRENT PREFIX*
━━━━━━━━━━━━━━━━━━
➡️ Prefix: \`${global.PREFIX || config.PREFIX}\`

💡 Example: ${global.PREFIX || config.PREFIX}prefix !
            `.trim(),
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      const newPrefix = args[0].trim();

      if (!newPrefix) {
        return sock.sendMessage(
          m.chat,
          {
            text: "❌ Invalid prefix.",
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      /* ================= SAVE ================= */
      saveConfig({ PREFIX: newPrefix });

      /* ================= SYNC GLOBAL ================= */
      global.PREFIX = newPrefix;
      config.PREFIX = newPrefix;

      return sock.sendMessage(
        m.chat,
        {
          text: `
✅ *PREFIX UPDATED*
━━━━━━━━━━━━━━━━━━
➡️ New prefix: \`${newPrefix}\`
          `.trim(),
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ prefix error:", err);

      return sock.sendMessage(
        m.chat,
        {
          text: "❌ Error while changing prefix.",
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};