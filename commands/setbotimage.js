import axios from 'axios';
import { setBotImage } from '../system/botAssets.js';
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'setbotimage',
  description: 'Change the bot image via a link',
  category: 'Owner',
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {
      const url = args[0];
      if (!url || !url.startsWith('http')) {
        return sock.sendMessage(
          m.chat,
          { text: '❌ Please provide a valid link to change the bot image.\nExample: `.setbotimage https://files.catbox.moe/s42m2j.jpg`', contextInfo },
          { quoted: m }
        );
      }

      // Check if the link is a valid image
      const res = await axios.get(url, { responseType: 'arraybuffer' });
      const contentType = res.headers['content-type'];

      if (!contentType || !contentType.startsWith('image/')) {
        return sock.sendMessage(
          m.chat,
          { text: '❌ The provided link does not contain a valid image.', contextInfo },
          { quoted: m }
        );
      }

      // Save the image URL
      setBotImage(url);

      await sock.sendMessage(
        m.chat,
        { text: '✅ Bot image updated successfully!', contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ setbotimage error:', err);
      await sock.sendMessage(
        m.chat,
        { text: '❌ Unable to change the bot image. Check the link or try again.', contextInfo },
        { quoted: m }
      );
    }
  }
};