// ==================== commands/prefix.js ====================
import config, { saveConfig } from '../config.js';
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'prefix',
  description: 'Change or display the bot prefix (KAYA-MD)',
  category: 'Owner',
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return sock.sendMessage(
          m.chat,
          {
            text: `
🔧 *CURRENT PREFIX*
━━━━━━━━━━━━━━━━━━
➡️ Prefix: \`${global.PREFIX || config.PREFIX}\`

💡 Example: .prefix !
            `.trim(),
            contextInfo
          },
          { quoted: m }
        );
      }

      const newPrefix = args.join(' ');

      // 💾 Save
      saveConfig({ PREFIX: newPrefix });

      // ⚡ Instant update
      global.PREFIX = newPrefix;

      return sock.sendMessage(
        m.chat,
        {
          text: `
✅ *PREFIX UPDATED*
━━━━━━━━━━━━━━━━━━
➡️ New prefix: \`${newPrefix}\`
          `.trim(),
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ prefix error:', err);
      return sock.sendMessage(
        m.chat,
        { text: '❌ Error while changing prefix.', contextInfo },
        { quoted: m }
      );
    }
  }
};