import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { BOT_NAME } from './botAssets.js';

function buildMediaLinkMessage(url, label = 'Image uploaded successfully!') {
    return `
╭────「 ${BOT_NAME} 」────⬣
│ 📤 ${label}
│ 🔗 Catbox Link:
│ ${url}
╰──────────────────⬣`.trim();
}

export default {
    name: 'url',
    alias: ['tourl'],
    description: 'Upload une image sur Catbox et renvoie son lien',
    category: 'Tools',
    usage: '.url (reply à une image)',

    async execute(sock, m) {
        try {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.imageMessage) {
                return sock.sendMessage(
                    m.chat,
                    { text: '⚠️ Réponds à une image avec .url' },
                    { quoted: m }
                );
            }

            const stream = await downloadContentFromMessage(
                quoted.imageMessage,
                'image'
            );

            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);

            const form = new FormData();
            form.append('reqtype', 'fileupload');
            form.append('fileToUpload', buffer, 'image.jpg');

            const { data: url } = await axios.post(
                'https://catbox.moe/user/api.php',
                form,
                {
                    headers: form.getHeaders()
                }
            );

            await sock.sendMessage(
                m.chat,
                {
                    text: buildMediaLinkMessage(url)
                },
                { quoted: m }
            );

        } catch (error) {
            console.error('URL command error:', error);

            await sock.sendMessage(
                m.chat,
                {
                    text: '❌ Failed to upload image.'
                },
                { quoted: m }
            );
        }
    }
};