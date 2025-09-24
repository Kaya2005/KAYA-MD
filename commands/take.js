// ==================== commands/take.js ====================
import { downloadMediaMessage, downloadContentFromMessage } from '@rexxhayanasi/elaina-bail';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { contextInfo } from '../utils/contextInfo.js';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default {
  name: 'take',
  description: 'Reprend un sticker/image/vidéo et met l’auteur = pseudo de la personne',
  category: 'Stickers',

  run: async (kaya, m, msg, store, args) => {
    try {
      const authorName = m.pushName || "User";

      const target = m.quoted ? m.quoted : m;

      if (!target.mtype || !['stickerMessage', 'imageMessage', 'videoMessage'].includes(target.mtype)) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Réponds à un sticker/image/vidéo valide.', contextInfo },
          { quoted: m }
        );
      }

      let buffer;

      
      if (typeof target.download === 'function') {
        buffer = await target.download();
      }

     
      if (!buffer) {
        try {
          buffer = await downloadMediaMessage(target, 'buffer', undefined, { logger: kaya.logger });
        } catch (err1) {
          
          const node = target.message?.[target.mtype] || target.msg;
          if (!node) throw new Error('Message média introuvable (aucun node)');

          const kind = target.mtype === 'stickerMessage' ? 'sticker' : target.mtype === 'imageMessage' ? 'image' : 'video';
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

      const sticker = new Sticker(buffer, {
        author: authorName,
        type: StickerTypes.FULL,
        quality: 70
      });

      const webp = await sticker.build();
      await kaya.sendMessage(m.chat, { sticker: webp }, { quoted: m });

    } catch (err) {
      console.error("Take error:", err);
      return kaya.sendMessage(
        m.chat,
        { text: "❌ Erreur lors de la création du sticker.", contextInfo },
        { quoted: m }
      );
    }
  }
};