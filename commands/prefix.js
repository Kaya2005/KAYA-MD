import config from '../config.js';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'prefix',
  description: 'Change or display bot prefix',
  category: 'Owner',
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {

      // ================= SHOW PREFIX =================
      if (!args[0]) {
        return sock.sendMessage(
          m.chat,
          {
            text: `
🔧 CURRENT PREFIX
━━━━━━━━━━━━━━
➡️ Prefix: ${global.PREFIX || config.PREFIX}

💡 Example:
${global.PREFIX || config.PREFIX}prefix !
            `.trim(),
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================= SET PREFIX =================
      const newPrefix = args[0].trim();

      if (!newPrefix) {
        return sock.sendMessage(
          m.chat,
          {
            text: '❌ Invalid prefix.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      if (newPrefix.length > 3) {
        return sock.sendMessage(
          m.chat,
          {
            text: '❌ Prefix too long (max 3 characters).',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================= UPDATE =================
      global.PREFIX = newPrefix;
      config.PREFIX = newPrefix;

      return sock.sendMessage(
        m.chat,
        {
          text: `
✅ PREFIX UPDATED
━━━━━━━━━━━━━━
➡️ New prefix: ${newPrefix}

⚠️ Ce changement est temporaire jusqu'au redémarrage du bot.
          `.trim(),
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ prefix.js error:', err);

      return sock.sendMessage(
        m.chat,
        {
          text: '❌ An error occurred.',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};