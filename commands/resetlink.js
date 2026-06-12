import checkAdminOrOwner from '../system/checkAdmin.js';
import decodeJid from '../system/decodeJid.js';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'resetlink',
  alias: ['grouplink', 'linkreset'],
  description: 'Resets the group invite link',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,
  usage: '.resetlink',

  run: async (kaya, m) => {
    try {
      if (!m.isGroup) return;

      const chatId = decodeJid(m.chat);
      const sender = decodeJid(m.sender);

      // 🔐 Check ADMIN / OWNER
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (!check.isAdminOrOwner) {
        return kaya.sendMessage(
          chatId,
          {
            text: '🚫 Only group Admins or the Owner can use this command.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // 🔁 Reset the invite link (without displaying it)
      await kaya.groupRevokeInvite(chatId);

      return kaya.sendMessage(
        chatId,
        {
          text: '✅ The group invite link has been successfully reset!',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ resetlink error:', err);

      return kaya.sendMessage(
        m.chat,
        {
          text: '❌ An error occurred while resetting the group link.',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};