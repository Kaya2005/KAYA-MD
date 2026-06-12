// ================= commands/add.js =================
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'add',
  description: 'Add a member to a group (Owner only)',
  category: 'Groupe',
  group: true,

  async execute(Kaya, m, args) {
    try {
      // ❌ Group only
      if (!m.isGroup) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: '❌ This command works only in groups.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // 🔐 Owner only
      if (!m.fromMe) return;

      // ❌ No number provided
      if (!args[0]) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: '❌ Usage: `.add 243XXXXXXXXX`',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // 📞 Clean number
      const number = args[0].replace(/\D/g, '');

      if (number.length < 8) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: '❌ Invalid phone number.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      const jid = `${number}@s.whatsapp.net`;

      // ➕ Add participant (silent)
      await Kaya.groupParticipantsUpdate(m.chat, [jid], 'add');

      // ✅ No success message (silent mode)

    } catch (err) {
      console.error('❌ ADD ERROR:', err);

      await Kaya.sendMessage(
        m.chat,
        {
          text: '❌ Failed to add this user (private account or already in the group).',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};