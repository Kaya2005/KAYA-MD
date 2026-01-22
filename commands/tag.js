import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import checkAdminOrOwner from '../system/checkAdmin.js';

async function downloadMediaMessage(message, mediaType) {
    const stream = await downloadContentFromMessage(message, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const filePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../temp', `${Date.now()}.${mediaType}`);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

export default {
    name: 'tag',
    description: 'Mention all group members with the written or quoted text/media',
    category: 'Groupe',
    group: true,
    admin: true,

    run: async (kaya, m, args) => {
        try {
            if (!m.key.remoteJid.endsWith('@g.us')) 
                return kaya.sendMessage(m.chat, { text: '❌ This command only works in groups.' }, { quoted: m });

            const perms = await checkAdminOrOwner(kaya, m.chat, m.sender);
            if (!perms.isAdminOrOwner) 
                return kaya.sendMessage(m.chat, { text: '⛔ Only admins or owner can use this command.' }, { quoted: m });

            const metadata = await kaya.groupMetadata(m.chat);
            const members = metadata.participants.map(p => p.id || p.jid).filter(Boolean);

            // Check quoted message
            const ctx = m.message?.extendedTextMessage?.contextInfo;
            const reply = ctx?.quotedMessage;

            let messageContent = {};

            if (reply) {
                if (reply.imageMessage) {
                    const filePath = await downloadMediaMessage(reply.imageMessage, 'image');
                    messageContent = {
                        image: { url: filePath },
                        caption: args.join(' ') || reply.imageMessage.caption || '📢 General mention',
                        mentions: members
                    };
                } else if (reply.videoMessage) {
                    const filePath = await downloadMediaMessage(reply.videoMessage, 'video');
                    messageContent = {
                        video: { url: filePath },
                        caption: args.join(' ') || reply.videoMessage.caption || '📢 General mention',
                        mentions: members
                    };
                } else if (reply.documentMessage) {
                    const filePath = await downloadMediaMessage(reply.documentMessage, 'document');
                    messageContent = {
                        document: { url: filePath },
                        fileName: reply.documentMessage.fileName,
                        caption: args.join(' ') || '📢 General mention',
                        mentions: members
                    };
                } else {
                    messageContent = {
                        text: args.join(' ') || reply.conversation || reply.extendedTextMessage?.text || '📢 General mention',
                        mentions: members
                    };
                }
            } else {
                messageContent = {
                    text: args.join(' ') || '📢 General mention',
                    mentions: members
                };
            }

            await kaya.sendMessage(m.chat, messageContent, { quoted: m });

        } catch (err) {
            console.error('❌ Tag command error:', err);
            await kaya.sendMessage(m.chat, { text: '❌ Error occurred while sending the tag.' }, { quoted: m });
        }
    }
};