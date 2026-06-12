import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import os from 'os';

import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys';

import { BOT_NAME } from '../system/botAssets.js';
import { buildMediaLinkMessage } from '../system/mediaMessageTemplate.js';

export default {

  name: 'url',

  alias: [
    'catbox',
    'upload',
    'link'
  ],

  description:
    '🔗 Génère un lien Catbox depuis un média',

  category: 'image',

  usage:
    '<reply média>',

  async execute(
    sock,
    m,
    args
  ) {

    try {

      // ====================================
      // QUOTED MESSAGE
      // ====================================

      const quoted =
        m.message
          ?.extendedTextMessage
          ?.contextInfo
          ?.quotedMessage;

      // ====================================
      // TYPES SUPPORTÉS
      // ====================================

      const mediaTypes = {

        imageMessage: 'image',

        videoMessage: 'video',

        audioMessage: 'audio',

        stickerMessage: 'sticker',

        documentMessage: 'document'
      };

      let mediaMessage;
      let mediaType;

      // ====================================
      // CHECK QUOTED MEDIA
      // ====================================

      if (quoted) {

        for (const key in mediaTypes) {

          if (quoted[key]) {

            mediaMessage =
              quoted[key];

            mediaType =
              mediaTypes[key];

            break;
          }
        }
      }

      // ====================================
      // CHECK DIRECT MEDIA
      // ====================================

      if (!mediaMessage) {

        for (const key in mediaTypes) {

          if (m.message?.[key]) {

            mediaMessage =
              m.message[key];

            mediaType =
              mediaTypes[key];

            break;
          }
        }
      }

      // ====================================
      // NO MEDIA
      // ====================================

      if (!mediaMessage) {

        return sock.sendMessage(

          m.chat,

          {
            text:
`📸 *${BOT_NAME}*

Réponds à :

• image
• vidéo
• audio
• sticker
• document

pour générer un lien Catbox.`
          },

          {
            quoted: m
          }
        );
      }

      // ====================================
      // PRESENCE
      // ====================================

      await sock.sendPresenceUpdate(
        'composing',
        m.chat
      );

      // ====================================
      // DOWNLOAD TYPE
      // ====================================

      const downloadType =
        mediaType === 'sticker'
          ? 'image'
          : mediaType;

      // ====================================
      // DOWNLOAD MEDIA
      // ====================================

      const stream =
        await downloadContentFromMessage(
          mediaMessage,
          downloadType
        );

      const chunks = [];

      for await (
        const chunk of stream
      ) {

        chunks.push(chunk);
      }

      const buffer =
        Buffer.concat(chunks);

      // ====================================
      // BUFFER CHECK
      // ====================================

      if (

        !buffer ||

        buffer.length < 10

      ) {

        return sock.sendMessage(

          m.chat,

          {
            text:
`❌ *${BOT_NAME}*

Impossible de lire ce média.`
          },

          {
            quoted: m
          }
        );
      }

      // ====================================
      // MIME TYPE
      // ====================================

      let mimetype =
        mediaMessage?.mimetype ||
        '';

      // fallback sticker
      if (
        mediaType === 'sticker' &&
        !mimetype
      ) {

        mimetype = 'image/webp';
      }

      // ====================================
      // EXTENSION
      // ====================================

      let ext = 'bin';

      if (
        mimetype.includes('png')
      ) ext = 'png';

      else if (
        mimetype.includes('jpeg')
      ) ext = 'jpg';

      else if (
        mimetype.includes('jpg')
      ) ext = 'jpg';

      else if (
        mimetype.includes('webp')
      ) ext = 'webp';

      else if (
        mimetype.includes('gif')
      ) ext = 'gif';

      else if (
        mimetype.includes('mp4')
      ) ext = 'mp4';

      else if (
        mimetype.includes('webm')
      ) ext = 'webm';

      else if (
        mimetype.includes('ogg')
      ) ext = 'ogg';

      else if (
        mimetype.includes('mpeg')
      ) ext = 'mp3';

      else if (
        mimetype.includes('mp3')
      ) ext = 'mp3';

      else if (
        mimetype.includes('pdf')
      ) ext = 'pdf';

      // ====================================
      // TEMP FILE
      // ====================================

      const tempPath = path.join(

        os.tmpdir(),

        `catbox_${Date.now()}.${ext}`
      );

      fs.writeFileSync(
        tempPath,
        buffer
      );

      // ====================================
      // FORM DATA
      // ====================================

      const form =
        new FormData();

      form.append(
        'reqtype',
        'fileupload'
      );

      form.append(
        'fileToUpload',
        fs.createReadStream(
          tempPath
        )
      );

      // ====================================
      // UPLOAD CATBOX
      // ====================================

      const response =
        await axios.post(

          'https://catbox.moe/user/api.php',

          form,

          {

            headers:
              form.getHeaders(),

            maxBodyLength:
              Infinity,

            maxContentLength:
              Infinity,

            timeout:
              120000
          }
        );

      // ====================================
      // DELETE TEMP FILE
      // ====================================

      try {

        fs.unlinkSync(
          tempPath
        );

      } catch {}

      // ====================================
      // URL
      // ====================================

      const url =
        String(
          response.data
        ).trim();

      // ====================================
      // INVALID URL
      // ====================================

      if (

        !url ||

        !url.startsWith(
          'https://'
        )

      ) {

        console.log(
          'Catbox response:',
          response.data
        );

        throw new Error(
          'Lien invalide'
        );
      }

      // ====================================
      // SEND RESULT
      // ====================================

      await sock.sendMessage(

        m.chat,

        {
          text:
            buildMediaLinkMessage(
              url
            )
        },

        {
          quoted: m
        }
      );

    } catch (err) {

      console.error(
        '❌ URL command error:',
        err?.response?.data || err
      );

      let msg =
`❌ *${BOT_NAME}*

Erreur upload média.`;

      // ====================================
      // TIMEOUT
      // ====================================

      if (

        err.code ===
          'ECONNABORTED'

        ||

        err.code ===
          'ETIMEDOUT'

        ||

        err.code ===
          'ECONNREFUSED'

      ) {

        msg =
`❌ *${BOT_NAME}*

Catbox indisponible.
Réessaie plus tard.`;
      }

      // ====================================
      // TOO LARGE
      // ====================================

      else if (
        err.response?.status === 413
      ) {

        msg =
`❌ *${BOT_NAME}*

Fichier trop volumineux (>20MB).`;
      }

      // ====================================
      // SEND ERROR
      // ====================================

      await sock.sendMessage(

        m.chat,

        {
          text: msg
        },

        {
          quoted: m
        }
      );
    }
  }
};