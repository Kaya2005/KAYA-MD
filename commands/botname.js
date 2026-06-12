// ================= commands/botname.js =================
import { setBotName, getBotName } from '../system/botAssets.js';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'botname',
  alias: ['setbotname'],
  description: 'Change the bot name without restarting',
  category: 'Owner',
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {
      const newName = args.join(' ').trim();

      // ❌ No name provided
      if (!newName) {
        return sock.sendMessage(
          m.chat,
          {
            text: `❌ Please provide a bot name.\nExample:\n.botname 𓊈 KAYA-MD V2 𓊉`,
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // 🔐 Safety limit
      if (newName.length > 40) {
        return sock.sendMessage(
          m.chat,
          {
            text: '❌ Bot name is too long (maximum 40 characters).',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ✅ Update bot name (no restart)
      setBotName(newName);

      await sock.sendMessage(
        m.chat,
        {
          text: `✅ Bot name updated successfully!\n\n🤖 New bot name: *${getBotName()}*`,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ botname error:', err);

      await sock.sendMessage(
        m.chat,
        {
          text: '❌ Failed to change the bot name.',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};