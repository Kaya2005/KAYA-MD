import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import checkAdminOrOwner from '../system/checkAdmin.js';

// ================== 🔹 Téléchargement médias ==================
async function downloadMediaMessage(message, mediaType) {
  const stream = await downloadContentFromMessage(message, mediaType);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  const tempDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const filePath = path.join(tempDir, `${Date.now()}.${mediaType}`);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

// ================== 🔹 Commande Tag ==================
export default {
  name: 'tag',
  description: 'Mention all group members with text or quoted media',
  category: 'Groupe',
  group: true,
  admin: true,

  run: async (kaya, m, args) => {
    try {
      if (!m.isGroup) 
        return kaya.sendMessage(m.chat, { text: '❌ This command only works in groups.' }, { quoted: m });

      // ✅ Vérification admin / owner
      const perms = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!perms.isAdminOrOwner)
        return kaya.sendMessage(m.chat, { text: '⛔ Only admins or owner can use this command.' }, { quoted: m });

      const groupMetadata = await kaya.groupMetadata(m.chat);
      const mentionedJidList = groupMetadata.participants.map(p => p.id || p.jid).filter(Boolean);

      // ✅ Gestion message cité
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      let messageContent = {};

      if (quoted) {
        if (quoted.imageMessage) {
          const filePath = await downloadMediaMessage(quoted.imageMessage, 'image');
          messageContent = {
            image: { url: filePath },
            caption: args.join(' ') || quoted.imageMessage.caption || '📢 Attention everyone!',
            mentions: mentionedJidList
          };
        } else if (quoted.videoMessage) {
          const filePath = await downloadMediaMessage(quoted.videoMessage, 'video');
          messageContent = {
            video: { url: filePath },
            caption: args.join(' ') || quoted.videoMessage.caption || '📢 Attention everyone!',
            mentions: mentionedJidList
          };
        } else if (quoted.documentMessage) {
          const filePath = await downloadMediaMessage(quoted.documentMessage, 'document');
          messageContent = {
            document: { url: filePath },
            fileName: quoted.documentMessage.fileName,
            caption: args.join(' ') || '📢 Attention everyone!',
            mentions: mentionedJidList
          };
        } else {
          messageContent = {
            text: args.join(' ') || quoted.conversation || quoted.extendedTextMessage?.text || '📢 Attention everyone!',
            mentions: mentionedJidList
          };
        }
      } else {
        // Pas de message cité
        messageContent = {
          text: args.join(' ') || '📢 Attention everyone!',
          mentions: mentionedJidList
        };
      }

      await kaya.sendMessage(m.chat, messageContent, { quoted: m });

    } catch (err) {
      console.error('❌ Tag command error:', err);
      await kaya.sendMessage(m.chat, { text: '❌ Error occurred while sending the tag.' }, { quoted: m });
    }
  }
};