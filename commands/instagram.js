import { igdl } from 'ruhend-scraper';
import axios from 'axios';
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'insta',
  alias: ['instagram', 'ig'],
  description: 'Download photos and videos from Instagram',
  category: 'Download',

  async run(kaya, m, args) {
    try {
      const text = args.join(' ').trim() || m.message?.conversation;

      if (!text) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Please provide a valid Instagram link.', contextInfo },
          { quoted: m }
        );
      }

      if (!/https?:\/\/(www\.)?(instagram\.com|instagr\.am)\//.test(text)) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ This is not a valid Instagram link.', contextInfo },
          { quoted: m }
        );
      }

      await kaya.sendMessage(
        m.chat,
        { text: '🔄 Fetching Instagram media...', contextInfo },
        { quoted: m }
      );

      const downloadData = await igdl(text);
      if (!downloadData?.data?.length) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ No media found. Private post or invalid link.', contextInfo },
          { quoted: m }
        );
      }

      const mediaData = downloadData.data.slice(0, 10);

      for (const media of mediaData) {
        const mediaUrl = media.url;
        const isVideo = media.type === 'video' || /\.(mp4)$/i.test(mediaUrl);

        // 🔹 Télécharger en buffer
        const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        if (isVideo) {
          await kaya.sendMessage(
            m.chat,
            { video: buffer, mimetype: 'video/mp4', caption: '✅ Instagram media downloaded!', contextInfo },
            { quoted: m }
          );
        } else {
          await kaya.sendMessage(
            m.chat,
            { image: buffer, caption: '✅ Instagram media downloaded!', contextInfo },
            { quoted: m }
          );
        }

        await new Promise(res => setTimeout(res, 1000));
      }

    } catch (err) {
      console.error('❌ Instagram command error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ Unable to fetch Instagram media. Try again later.', contextInfo },
        { quoted: m }
      );
    }
  }
};