import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Readable } from 'stream';
import { BOT_NAME } from '../system/botAssets.js';
import { buildMediaLinkMessage } from '../system/mediaMessageTemplate.js';

export default {
  name: 'url',
  alias: ['catbox', 'upload', 'link'],
  description: '🔗 Generates a Catbox link from media (image, video, audio, sticker)',
  category: 'Image',
  usage: '<reply to media>',

  async execute(sock, m, args) {
    try {
      // Check quoted message or self
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage'];
      let mediaMessage, type;

      for (let t of mediaTypes) {
        if (quoted?.[t]) {
          mediaMessage = quoted[t];
          type = t;
          break;
        } else if (m.message?.[t]) {
          mediaMessage = m.message[t];
          type = t;
          break;
        }
      }

      if (!mediaMessage) {
        return sock.sendMessage(m.chat, {
          text: `📸 *${BOT_NAME}* - Usage: Reply to an image, video, audio, or sticker to generate a Catbox link`
        }, { quoted: m });
      }

      await sock.sendPresenceUpdate('composing', m.chat);

      // Download content
      const stream = await downloadContentFromMessage(mediaMessage, type.replace('Message','').toLowerCase());
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      if (!buffer || buffer.length < 100) {
        return sock.sendMessage(m.chat, {
          text: `❌ *${BOT_NAME}* - Unable to read this file (too small or corrupted)`
        }, { quoted: m });
      }

      // Determine file extension
      let ext = 'bin';
      const mimetype = mediaMessage?.mimetype || '';
      if (mimetype.includes('png')) ext = 'png';
      else if (mimetype.includes('jpeg')) ext = 'jpg';
      else if (mimetype.includes('webp')) ext = 'webp';
      else if (mimetype.includes('gif')) ext = 'gif';
      else if (mimetype.includes('mp4')) ext = 'mp4';
      else if (mimetype.includes('webm')) ext = 'webm';
      else if (mimetype.includes('ogg')) ext = 'ogg';
      else if (mimetype.includes('mp3')) ext = 'mp3';

      // Prepare FormData
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', Readable.from(buffer), `file.${ext}`);

      // Upload to Catbox
      const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      const url = response.data.trim();

      // Send styled link message
      await sock.sendMessage(m.chat, { 
        text: buildMediaLinkMessage(url)
      }, { quoted: m });

    } catch (err) {
      console.error('❌ URL command error:', err);
      let msg = `❌ *${BOT_NAME}* - Error uploading media.`;
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        msg = `❌ *${BOT_NAME}* - Catbox unreachable. Try again later.`;
      } else if (err.response?.status === 413) {
        msg = `❌ *${BOT_NAME}* - File too large (>20MB).`;
      }
      await sock.sendMessage(m.chat, { text: msg }, { quoted: m });
    }
  }
};