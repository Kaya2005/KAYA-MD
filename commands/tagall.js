import { sendWithBotImage } from '../system/botAssets.js';
import { buildTagAllMessage } from '../system/tagallTemplate.js';

export default {
  name: "tagall",
  alias: ["mention", "everyone"],
  description: "📢 Mentionne tous les membres du groupe avec une liste numérotée.",
  category: "Groupe",
  group: true,
  admin: false,

  execute: async (kaya, m) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: "⛔ Cette commande est uniquement disponible dans les groupes." },
          { quoted: m }
        );
      }

      const metadata = await kaya.groupMetadata(m.chat);
      const participants = metadata.participants.map(p => p.id);

      const now = new Date();
      const date = now.toLocaleDateString('fr-FR');
      const time = now.toLocaleTimeString('fr-FR');

      const mentionText = participants
        .map((p, i) => `${i + 1}. @${p.split('@')[0]}`)
        .join('\n');

      const fullMessage = buildTagAllMessage({
        date,
        time,
        membersCount: participants.length,
        mentionText
      });

      await sendWithBotImage(
        kaya,
        m.chat,
        {
          caption: fullMessage,
          mentions: participants,
          contextInfo: { mentionedJid: participants }
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("❌ Erreur tagall :", error);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors de la mention." },
        { quoted: m }
      );
    }
  }
};