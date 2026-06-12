import { getAudioUrl } from '../lib/tts.js';
import { BOT_NAME } from '../system/botAssets.js';
import axios from 'axios';

export default {
  name: 'voice',
  description: '🎤 Converts text into a voice message',
  category: 'General',

  run: async (kaya, m, args) => {
    try {
      if (!args.length) {
        return kaya.sendMessage(
          m.chat,
          { text: `❌ *${BOT_NAME}* - Please provide text.\n\nUsage:\n.voice <text>` },
          { quoted: m }
        );
      }

      const text = args.join(' ').slice(0, 200); // ⚠️ limiter

      const url = getAudioUrl(text, { lang: 'fr' });

      const response = await axios.get(url, {
        responseType: 'arraybuffer'
      });

      const buffer = Buffer.from(response.data);

      await kaya.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: 'audio/mpeg',
          ptt: true
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ voice error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: `❌ *${BOT_NAME}* - Failed to generate voice.` },
        { quoted: m }
      );
    }
  }
};