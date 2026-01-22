import { addExif } from '../lib/sticker.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: 'sticker',
    alias: ['s', 'stiker', 'stick'],
    description: 'Convert image or video to sticker',
    category: 'Sticker',

    async execute(sock, m) {
        try {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            const imageMessage =
                quoted?.imageMessage || m.message?.imageMessage;
            const videoMessage =
                quoted?.videoMessage || m.message?.videoMessage;

            if (!imageMessage && !videoMessage) {
                return sock.sendMessage(
                    m.chat,
                    {
                        text:
`⚠️ Usage:
• Reply to an image or video with .sticker
• Send an image/video with caption .sticker

📌 Video must be under 10 seconds`
                    },
                    { quoted: m }
                );
            }

            await sock.sendPresenceUpdate('composing', m.chat);

            // 📥 Download media
            const mediaType = imageMessage ? 'image' : 'video';
            const message = imageMessage || videoMessage;

            // ⛔ Limit video duration
            if (videoMessage?.seconds > 10) {
                return sock.sendMessage(
                    m.chat,
                    { text: '❌ Video too long. Max 10 seconds.' },
                    { quoted: m }
                );
            }

            const stream = await downloadContentFromMessage(message, mediaType);
            const chunks = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);
            if (!buffer.length) {
                return sock.sendMessage(
                    m.chat,
                    { text: '❌ Failed to download media.' },
                    { quoted: m }
                );
            }

            // 🎨 Sticker options
            const stickerOptions = {
                packname: global.packname || 'KAYA-MD',
                author: global.author || 'kaya-tech',
                quality: 50,
                type: videoMessage ? 'animated' : 'full'
            };

            // 🧷 Create sticker
            const stickerBuffer = await addExif(buffer, stickerOptions);

            // 📤 Send sticker
            await sock.sendMessage(
                m.chat,
                {
                    sticker: stickerBuffer,
                    mimetype: 'image/webp'
                },
                { quoted: m }
            );

        } catch (err) {
            console.error('❌ Sticker error:', err);
            await sock.sendMessage(
                m.chat,
                {
                    text:
`❌ Failed to create sticker.

Make sure:
• Media is valid
• Video is under 10 seconds
• Format is supported`
                },
                { quoted: m }
            );
        }
    }
};