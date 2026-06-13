import config, { saveConfig } from '../config.js';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'prefix',
  description: 'Change or display bot prefix',
  category: 'Owner',
  ownerOnly: true,

  run: async (kaya, m, args) => {
    try {

      const action = args[0]?.toLowerCase();

      // ================= SHOW PREFIX =================
      if (!action) {
        return kaya.sendMessage(
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
      const newPrefix = args[0];

      if (!newPrefix) {
        return kaya.sendMessage(
          m.chat,
          {
            text: '❌ Invalid prefix.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // optional safety
      if (newPrefix.length > 3) {
        return kaya.sendMessage(
          m.chat,
          {
            text: '❌ Prefix too long (max 3 characters).',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================= SAVE =================
      global.PREFIX = newPrefix;
      config.PREFIX = newPrefix;
      saveConfig({ PREFIX: newPrefix });

      return kaya.sendMessage(
        m.chat,
        {
          text: `
✅ PREFIX UPDATED
━━━━━━━━━━━━━━
➡️ New prefix: ${newPrefix}
          `.trim(),
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ prefix.js error:', err);

      return kaya.sendMessage(
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