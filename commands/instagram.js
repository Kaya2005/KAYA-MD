import axios from 'axios';
import { igdl } from 'ruhend-scraper';
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'insta',
  alias: ['instagram', 'ig'],
  description: 'Download photos and videos from Instagram',
  category: 'Download',

  async run(kaya, m, args) {
    try {
      const text = args.join(' ') || m.body || m.caption || '';

      if (!text) {
        return kaya.sendMessage(m.chat, {
          text: '❌ Please provide a valid Instagram link.',
          contextInfo
        }, { quoted: m });
      }

      const urlMatch = text.match(/https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/\S+/i);
      if (!urlMatch) {
        return kaya.sendMessage(m.chat, {
          text: '❌ This is not a valid Instagram link.',
          contextInfo
        }, { quoted: m });
      }

      const url = urlMatch[0];

      await kaya.sendMessage(m.chat, {
        text: '🔄 Fetching Instagram media...',
        contextInfo
      }, { quoted: m });

      let mediaList = [];

      // ---------- METHOD 1 ----------
      try {
        const res = await igdl(url);
        if (res?.data?.length) mediaList = res.data;
      } catch {}

      // ---------- FALLBACK METHOD ----------
      if (!mediaList.length) {
        const api = `https://api.douyin.wtf/api/ig?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api, { timeout: 20000 });
        if (data?.data?.length) mediaList = data.data;
      }

      if (!mediaList.length) {
        return kaya.sendMessage(m.chat, {
          text: '❌ Unable to fetch media (private / expired / blocked).',
          contextInfo
        }, { quoted: m });
      }

      mediaList = mediaList.slice(0, 10);

      for (const media of mediaList) {
        const buffer = await axios.get(media.url, { responseType: 'arraybuffer' }).then(r => r.data);

        if (media.type === 'video') {
          await kaya.sendMessage(m.chat, {
            video: buffer,
            mimetype: 'video/mp4',
            caption: '✅ Instagram download',
            contextInfo
          }, { quoted: m });
        } else {
          await kaya.sendMessage(m.chat, {
            image: buffer,
            caption: '✅ Instagram download',
            contextInfo
          }, { quoted: m });
        }

        await new Promise(r => setTimeout(r, 1000));
      }

    } catch (err) {
      console.error('❌ Instagram command error:', err);
      return kaya.sendMessage(m.chat, {
        text: '❌ Download failed. Try another link.',
        contextInfo
      }, { quoted: m });
    }
  }
};