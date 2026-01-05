import checkAdminOrOwner from '../system/checkAdmin.js';
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'lock',
  description: '🔒 Lock the group (only admins can send messages)',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      // 🔹 Check admin / owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          {
            text: '🚫 Access denied: Only admins or owners can use this command.',
            contextInfo
          },
          { quoted: m }
        );
      }

      // 🔹 Lock the group (announcement mode)
      await kaya.groupSettingUpdate(m.chat, 'announcement');

      const text = `
╭━━〔🔒 GROUP LOCKED〕━━⬣
┃ 🚫 Only admins can send messages.
┃ 📌 To unlock: *.unlock*
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim();

      await kaya.sendMessage(
        m.chat,
        { text, mentions: [m.sender], contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ lock.js error:', err);
      await kaya.sendMessage(
        m.chat,
        {
          text: '❌ Unable to lock the group. Make sure I am an admin.',
          contextInfo
        },
        { quoted: m }
      );
    }
  }
};