import config, { saveConfig } from "../config.js";
import { getContextInfo } from "../system/contextInfo.js";

export default {
  name: "prefix",
  description: "Change or display bot prefix",
  category: "Owner",
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {

      const action = args[0]?.toLowerCase();

      /* ================= SHOW PREFIX ================= */
      if (!action) {
        return sock.sendMessage(
          m.chat,
          {
            text: `
🔧 *CURRENT PREFIX*
━━━━━━━━━━━━━━━━━━
➡️ Prefix: \`${global.PREFIX || config.PREFIX}\`

💡 Example:
${global.PREFIX || config.PREFIX}prefix !
            `.trim(),
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      /* ================= SET PREFIX ================= */
      const newPrefix = args[0];

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

      saveConfig({ PREFIX: newPrefix });

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