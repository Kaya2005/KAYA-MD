// ==================== commands/write.js ====================
import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: 'write',
  alias: ['text'],
  category: 'Fun',
  description: 'Write text on a replied image or sticker',

  run: async (sock, m, args) => {
    const chatId = m.chat;
    const text = args.join(' ').trim();

    if (!text) {
      return sock.sendMessage(
        chatId,
        { text: '❌ Usage: reply to an image or sticker\n.write KAYA' },
        { quoted: m }
      );
    }

    // ✅ MESSAGE CITÉ (bonne méthode)
    const quoted = m.quoted;
    if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage)) {
      return sock.sendMessage(
        chatId,
        { text: '❌ Reply to an image or a sticker.' },
        { quoted: m }
      );
    }

    try {
      // 📥 DOWNLOAD MEDIA
      const msgType = quoted.imageMessage ? 'image' : 'sticker';
      const stream = await downloadContentFromMessage(
        quoted[msgType + 'Message'],
        msgType
      );

      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // 🌐 UPLOAD TO TELEGRAPH
      const form = new FormData();
      form.append('file', buffer, 'image.png');

      const upload = await axios.post(
        'https://telegra.ph/upload',
        form,
        { headers: form.getHeaders() }
      );

      const imageUrl = `https://telegra.ph${upload.data[0].src}`;

      // ✍️ WRITE TEXT (API STABLE)
      const result = await axios.get(
        `https://api.popcat.xyz/write?text=${encodeURIComponent(text)}&image=${encodeURIComponent(imageUrl)}`,
        { responseType: 'arraybuffer' }
      );

      // 📤 SEND IMAGE
      await sock.sendMessage(
        chatId,
        { image: Buffer.from(result.data) },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ write error:', err);
      await sock.sendMessage(
        chatId,
        { text: '❌ Failed to generate image.' },
        { quoted: m }
      );
    }
  }
};