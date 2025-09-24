// ==================== commands/photo.js ====================
import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import { downloadMediaMessage, downloadContentFromMessage } from '@rexxhayanasi/elaina-bail';
import { contextInfo } from '../utils/contextInfo.js';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export const name = 'photo';
export const description = 'Convertit un sticker en image PNG';
export const category = 'Stickers';

export async function run(kaya, m, msg, store, args) {
  try {
    const target = m.quoted ? m.quoted : m;

    if (!target.mtype || target.mtype !== 'stickerMessage') {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Réponds à un sticker avec `.photo`', contextInfo },
        { quoted: m }
      );
    }

    let buffer;

    // Cas spécial Elaina Bail : message a déjà une méthode download()
    if (typeof target.download === 'function') {
      buffer = await target.download();
    }

    // Sinon fallback sur downloadMediaMessage
    if (!buffer) {
      try {
        buffer = await downloadMediaMessage(target.msg || target.message[target.mtype], 'sticker', { logger: kaya.logger });
      } catch (err1) {
        // Fallback classique avec downloadContentFromMessage
        const node = target.msg || target.message?.[target.mtype];
        if (!node) throw new Error('Sticker introuvable pour téléchargement');

        const stream = await downloadContentFromMessage(node, 'sticker');
        buffer = await streamToBuffer(stream);
      }
    }

    if (!buffer || buffer.length < 100) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Impossible de lire ce sticker.', contextInfo },
        { quoted: m }
      );
    }

    const outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.png`);
    await sharp(buffer).png().toFile(outputPath);

    await kaya.sendMessage(
      m.chat,
      {
        image: fs.readFileSync(outputPath),
        caption: '✅ Sticker converti en image PNG',
        contextInfo
      },
      { quoted: m }
    );

    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error('Sticker to photo error:', err);
    return kaya.sendMessage(
      m.chat,
      { text: '❌ Une erreur est survenue lors de la conversion.', contextInfo },
      { quoted: m }
    );
  }
}