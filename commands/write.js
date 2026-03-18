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

    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: reply to an image or sticker\n.write KAYA' }, { quoted: m });

    const quoted = m.quoted;
    if (!quoted || (!quoted.imageMessage && !quoted.stickerMessage))
      return sock.sendMessage(chatId, { text: '❌ Reply to an image or a sticker.' }, { quoted: m });

    try {
      // Download media
      const type = quoted.imageMessage ? 'image' : 'sticker';
      const stream = await downloadContentFromMessage(quoted[type + 'Message'], type);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      // Upload to telegra.ph
      const form = new FormData();
      form.append('file', buffer, 'media.png');
      const upload = await axios.post('https://telegra.ph/upload', form, { headers: form.getHeaders() });

      if (!upload.data[0]?.src) throw new Error('Upload failed');
      const imageUrl = `https://telegra.ph${upload.data[0].src}`;

      // Write text using Popcat API
      const result = await axios.get(
        `https://api.popcat.xyz/write?text=${encodeURIComponent(text)}&image=${encodeURIComponent(imageUrl)}`,
        { responseType: 'arraybuffer' }
      );

      // Send image
      await sock.sendMessage(chatId, { image: Buffer.from(result.data), mimetype: 'image/png' }, { quoted: m });

    } catch (err) {
      console.error('❌ write error:', err);
      await sock.sendMessage(chatId, { text: '❌ Failed to generate image. Check the API or media type.' }, { quoted: m });
    }
  }
};