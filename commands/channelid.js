// ================= commands/channelid.js =================
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'channelid',
  description: 'Get WhatsApp Channel ID from channel link',
  category: 'General',

  async execute(Kaya, m, args) {
    try {
      // ❌ No link provided
      if (!args[0]) {
        return Kaya.sendMessage(
          m.chat,
          {
            text:
              '❌ Usage:\n.channelid https://whatsapp.com/channel/XXXX',
            contextInfo
          },
          { quoted: m }
        );
      }

      // 🔎 Extract channel invite code
      const match = args[0].match(/channel\/([A-Za-z0-9]+)/);
      if (!match) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: '❌ Invalid WhatsApp Channel link.',
            contextInfo
          },
          { quoted: m }
        );
      }

      const inviteCode = match[1];

      // 📡 Fetch channel metadata
      const info = await Kaya.newsletterMetadata('invite', inviteCode);

      if (!info?.id) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: '❌ Unable to fetch Channel ID.',
            contextInfo
          },
          { quoted: m }
        );
      }

      // ✅ Send Channel ID
      await Kaya.sendMessage(
        m.chat,
        {
          text: `✅ *WhatsApp Channel ID*\n\n${info.id}@newsletter`,
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ CHANNELID ERROR:', err);
      await Kaya.sendMessage(
        m.chat,
        {
          text: '❌ Error while retrieving Channel ID.',
          contextInfo
        },
        { quoted: m }
      );
    }
  }
};