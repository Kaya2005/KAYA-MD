import { sendWithBotImage } from '../system/botAssets.js';
import { buildTagAllMessage } from '../system/tagallTemplate.js';

export default {
  name: "tagall",
  alias: ["mention", "everyone"],
  description: "📢 Mentions all group members with a numbered list.",
  category: "Groupe",
  group: true,
  admin: false,

  execute: async (kaya, m) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: "⛔ This command can only be used in groups." },
          { quoted: m }
        );
      }

      const metadata = await kaya.groupMetadata(m.chat);
      const participants = metadata.participants.map(p => p.id);

      const now = new Date();
      const date = now.toLocaleDateString('en-GB');
      const time = now.toLocaleTimeString('en-GB');

      const mentionText = participants
        .map((p, i) => `${i + 1}. @${p.split('@')[0]}`)
        .join('\n');

      const totalCmds = kaya.commands.size || 0; // or your total commands variable
      const thumbnailBuffer = null; // or provide a buffer if you want an image preview

      const { messageText, externalAdReply } = buildTagAllMessage({
        date,
        time,
        membersCount: participants.length,
        mentionText,
        totalCmds,
        thumbnailBuffer
      });

      await sendWithBotImage(
        kaya,
        m.chat,
        {
          caption: messageText,
          mentions: participants,
          contextInfo: { mentionedJid: participants },
          externalAdReply
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("❌ TagAll Error:", error);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ An error occurred while mentioning all members." },
        { quoted: m }
      );
    }
  }
};