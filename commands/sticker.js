// ==================== commands/sticker.js ====================
import { downloadMediaMessage, downloadContentFromMessage } from '@rexxhayanasi/elaina-bail';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { contextInfo } from '../utils/contextInfo.js';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default {
  name: 'sticker',
  description: 'Convertit une image (ou courte vidéo) en sticker',
  category: 'Stickers',

  run: async (kaya, m) => {
    try {
      const target = m.quoted ? m.quoted : m;

      if (!target.mtype || !['imageMessage', 'videoMessage'].includes(target.mtype)) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Réponds à une image ou vidéo.', contextInfo },
          { quoted: m }
        );
      }

      if (target.mtype === 'videoMessage') {
        const seconds = target.msg?.seconds || target.seconds || 0;
        if (seconds > 8) {
          return kaya.sendMessage(
            m.chat,
            { text: '⏱️ La vidéo est trop longue. Max 8 secondes.', contextInfo },
            { quoted: m }
          );
        }
      }

      let buffer;

      // Cas spécial Elaina Bail : message a déjà une méthode download()
      if (typeof target.download === 'function') {
        buffer = await target.download();
      }

      // Sinon on tente downloadMediaMessage
      if (!buffer) {
        try {
          buffer = await downloadMediaMessage(target, 'buffer', undefined, {
            logger: kaya.logger,
            reuploadRequest: kaya.updateMediaMessage
          });
        } catch (err1) {
          // Fallback classique
          const node = target.message?.[target.mtype] || target.msg;
          if (!node) throw new Error('Message média introuvable (aucun node)');

          const kind = target.mtype === 'imageMessage' ? 'image' : 'video';
          const stream = await downloadContentFromMessage(node, kind);
          buffer = await streamToBuffer(stream);
        }
      }

      if (!buffer || buffer.length < 100) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Impossible de lire ce média.', contextInfo },
          { quoted: m }
        );
      }

      const pseudo = m.pushName || 'User';
      const sticker = new Sticker(buffer, {
        author: `${pseudo} by KAYA-MD`,
        type: StickerTypes.FULL,
        quality: 80
      });

      const webp = await sticker.build();
      await kaya.sendMessage(m.chat, { sticker: webp }, { quoted: m });

    } catch (err) {
      console.error('Sticker final error:', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Erreur lors de la création du sticker.', contextInfo },
        { quoted: m }
      );
    }
  }
};