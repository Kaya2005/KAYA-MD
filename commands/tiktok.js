import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Tiktok } from '../lib/tiktok.js';
import { getContextInfo } from '../system/contextInfo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: 'tiktok',
  description: 'Download a TikTok video without watermark.',
  category: 'Download',

  async run(kaya, m, args, store) {
    const query = args.join(" ");

    if (!query) {
      return kaya.sendMessage(
        m.chat,
        {
          text: `❌ No link detected!\nUsage: tiktok https://vm.tiktok.com/xxx`,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }

    try {
      const data = await Tiktok(query);

      if (!data?.nowm) {
        return kaya.sendMessage(
          m.chat,
          {
            text: '❌ Unable to retrieve the TikTok video.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const filePath = path.join(tempDir, `tiktok_${Date.now()}.mp4`);

      const res = await axios.get(data.nowm, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://www.tiktok.com/'
        }
      });

      fs.writeFileSync(filePath, res.data);

      await kaya.sendMessage(
        m.chat,
        {
          video: { url: filePath },
          caption:
`🎬 TikTok Video
📌 Title: ${data.title || "Unavailable"}
👤 Author: ${data.author || "Unknown"}
By: KAYA-MD`,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error('❌ TikTok Error:', err);

      await kaya.sendMessage(
        m.chat,
        {
          text: `❌ Error: ${err.message || "Unknown"}`,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};