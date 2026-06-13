import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { downloadContentFromMessage } from '@whiskeysockets/baileys';

import { BOT_NAME } from '../system/botAssets.js';
import { buildMediaLinkMessage } from '../system/mediaMessageTemplate.js';

export default {

  name: 'url',

  alias: ['catbox', 'upload', 'link'],

  description: '🔗 Génère un lien Catbox depuis un média',

  category: 'image',

  usage: '<reply média>',

  async execute(sock, m, args) {

    try {

      // ====================================
      // MESSAGE + QUOTED
      // ====================================

      const current = m.message || {};

      const quoted =
        current?.extendedTextMessage?.contextInfo?.quotedMessage || null;

      const mediaTypes = {
        imageMessage: 'image',
        videoMessage: 'video',
        audioMessage: 'audio',
        stickerMessage: 'image',
        documentMessage: 'document'
      };

      let mediaMessage = null;
      let mediaType = null;

      // DIRECT MEDIA
      for (const key of Object.keys(mediaTypes)) {
        if (current[key]) {
          mediaMessage = current[key];
          mediaType = mediaTypes[key];
          break;
        }
      }

      // QUOTED MEDIA
      if (!mediaMessage && quoted) {
        for (const key of Object.keys(mediaTypes)) {
          if (quoted[key]) {
            mediaMessage = quoted[key];
            mediaType = mediaTypes[key];
            break;
          }
        }
      }

      // NO MEDIA
      if (!mediaMessage) {
        return sock.sendMessage(
          m.chat,
          {
            text: `📸 *${BOT_NAME}*

Réponds à :

• image
• vidéo
• audio
• sticker
• document

pour générer un lien.`
          },
          { quoted: m }
        );
      }

      // PRESENCE
      await sock.sendPresenceUpdate('composing', m.chat);

      // DOWNLOAD
      const stream = await downloadContentFromMessage(mediaMessage, mediaType);
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      if (!buffer || buffer.length === 0) {
        throw new Error('Impossible de télécharger le média');
      }

      // MIME
      let mimetype = mediaMessage?.mimetype || '';

      if (mediaType === 'image' && !mimetype) {
        mimetype = 'image/jpeg';
      }

      if (mediaType === 'document' && !mimetype) {
        mimetype = 'application/octet-stream';
      }

      // EXTENSION
      let ext = 'bin';

      if (mimetype.includes('png')) ext = 'png';
      else if (mimetype.includes('jpeg')) ext = 'jpg';
      else if (mimetype.includes('jpg')) ext = 'jpg';
      else if (mimetype.includes('webp')) ext = 'webp';
      else if (mimetype.includes('gif')) ext = 'gif';
      else if (mimetype.includes('mp4')) ext = 'mp4';
      else if (mimetype.includes('webm')) ext = 'webm';
      else if (mimetype.includes('ogg')) ext = 'ogg';
      else if (mimetype.includes('mpeg') || mimetype.includes('mp3')) ext = 'mp3';
      else if (mimetype.includes('pdf')) ext = 'pdf';

      // TEMP FILE
      const tempPath = path.join(os.tmpdir(), `catbox_${Date.now()}.${ext}`);
      fs.writeFileSync(tempPath, buffer);

      // UPLOAD
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(tempPath));

      const response = await axios.post(
        'https://catbox.moe/user/api.php',
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 120000
        }
      );

      try {
        fs.unlinkSync(tempPath);
      } catch {}

      const url = String(response.data).trim();

      if (!url.startsWith('https://')) {
        throw new Error('Lien invalide');
      }

      await sock.sendMessage(
        m.chat,
        {
          text: buildMediaLinkMessage(url)
        },
        { quoted: m }
      );

    } catch (err) {

      console.error('❌ URL command error:', err?.response?.data || err);

      let msg = `❌ *${BOT_NAME}*\n\nErreur upload média.`;

      if (
        err.code === 'ECONNABORTED' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNREFUSED'
      ) {
        msg = `❌ *${BOT_NAME}*\n\nCatbox indisponible.\nRéessaie plus tard.`;
      }

      else if (err.response?.status === 413) {
        msg = `❌ *${BOT_NAME}*\n\nFichier trop volumineux (>20MB).`;
      }

      await sock.sendMessage(
        m.chat,
        { text: msg },
        { quoted: m }
      );
    }
  }
};