import { getAudioUrl } from '../lib/tts.js';
import { BOT_NAME } from '../system/botAssets.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';

export default {
  name: 'voice',
  description: '🎤 Converts text into a voice message in French',
  category: 'General',
  ownerOnly: false,

  run: async (kaya, m, args) => {
    try {
      if (!args.length) {
        return kaya.sendMessage(
          m.chat,
          { text: `❌ *${BOT_NAME}* - Please provide text to convert into voice.\n\nUsage:\n.voice <text>` },
          { quoted: m }
        );
      }

      const text = args.join(' ');
      const maxLen = 200; // Google TTS limit
      const segments = [];

      // Split text into segments if too long
      for (let i = 0; i < text.length; i += maxLen) {
        segments.push(text.slice(i, i + maxLen));
      }

      const buffers = [];
      for (const segment of segments) {
        const url = getAudioUrl(segment, { lang: 'fr', slow: false }); // Always French
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        buffers.push(Buffer.from(response.data));
      }

      // Combine all segments
      const finalBuffer = Buffer.concat(buffers);
      const tempFile = path.join(os.tmpdir(), `voice_fr_${Date.now()}.mp3`);
      fs.writeFileSync(tempFile, finalBuffer);

      // Send the voice note
      await kaya.sendMessage(
        m.chat,
        {
          audio: fs.createReadStream(tempFile),
          mimetype: 'audio/mpeg',
          ptt: true
        },
        { quoted: m }
      );

      fs.unlinkSync(tempFile);

    } catch (err) {
      console.error('❌ voice command error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: `❌ *${BOT_NAME}* - An error occurred while generating the voice message.` },
        { quoted: m }
      );
    }
  }
};