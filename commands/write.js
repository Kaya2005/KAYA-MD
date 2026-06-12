import axios from 'axios';
import FormData from 'form-data';

import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys';

export default {

  name: 'write',

  alias: ['text'],

  category: 'Fun',

  description:
    'Write text on image/sticker',

  async run(
    sock,
    m,
    args
  ) {

    const chatId =
      m.chat;

    const text =
      args.join(' ').trim();

    // ====================================
    // TEXT CHECK
    // ====================================

    if (!text) {

      return sock.sendMessage(

        chatId,

        {
          text:
`❌ Usage :

Reply à une image/sticker

.write KAYA`
        },

        {
          quoted: m
        }
      );
    }

    // ====================================
    // GET QUOTED
    // ====================================

    const quoted =
      m.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage;

    // ====================================
    // CHECK MEDIA
    // ====================================

    if (

      !quoted?.imageMessage &&

      !quoted?.stickerMessage

    ) {

      return sock.sendMessage(

        chatId,

        {
          text:
            '❌ Reply to an image or a sticker.'
        },

        {
          quoted: m
        }
      );
    }

    try {

      // ====================================
      // PRESENCE
      // ====================================

      await sock.sendPresenceUpdate(
        'composing',
        chatId
      );

      // ====================================
      // TYPE
      // ====================================

      const type =
        quoted.imageMessage

          ? 'image'

          : 'sticker';

      // ====================================
      // MEDIA OBJECT
      // ====================================

      const media =
        quoted[
          `${type}Message`
        ];

      // ====================================
      // DOWNLOAD
      // ====================================

      const stream =
        await downloadContentFromMessage(
          media,
          type
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
      // EMPTY BUFFER
      // ====================================

      if (
        !buffer ||
        buffer.length < 10
      ) {

        throw new Error(
          'Invalid media'
        );
      }

      // ====================================
      // TELEGRAPH UPLOAD
      // ====================================

      const form =
        new FormData();

      form.append(
        'file',
        buffer,
        'media.png'
      );

      const upload =
        await axios.post(

          'https://telegra.ph/upload',

          form,

          {
            headers:
              form.getHeaders(),

            timeout: 60000
          }
        );

      // ====================================
      // CHECK UPLOAD
      // ====================================

      if (
        !upload.data?.[0]?.src
      ) {

        throw new Error(
          'Upload failed'
        );
      }

      const imageUrl =
        `https://telegra.ph${upload.data[0].src}`;

      // ====================================
      // POPCAT API
      // ====================================

      const result =
        await axios.get(

          `https://api.popcat.xyz/write?text=${encodeURIComponent(text)}&image=${encodeURIComponent(imageUrl)}`,

          {
            responseType:
              'arraybuffer',

            timeout: 60000
          }
        );

      // ====================================
      // SEND RESULT
      // ====================================

      await sock.sendMessage(

        chatId,

        {

          image:
            Buffer.from(
              result.data
            ),

          mimetype:
            'image/png'
        },

        {
          quoted: m
        }
      );

    } catch (err) {

      console.error(
        '❌ write error:',
        err
      );

      await sock.sendMessage(

        chatId,

        {
          text:
`❌ Failed to generate image.

Possible causes:
• API offline
• Invalid sticker
• Unsupported media`
        },

        {
          quoted: m
        }
      );
    }
  }
};