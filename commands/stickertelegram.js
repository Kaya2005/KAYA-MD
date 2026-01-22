// ==================== commands/tg.js ====================
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { writeExif } from '../lib/exif.js';

const delay = time => new Promise(res => setTimeout(res, time));
const BATCH_SIZE = 5;
const BATCH_DELAY = 2000;
const MAX_STICKERS = 120;

export default {
  name: 'tg',
  alias: ['telegram', 'stickertg'],
  description: 'Download a Telegram sticker pack and send it on WhatsApp',
  category: 'Sticker',

  async run(kaya, m, args) {
    try {
      const url = args[0];
      if (!url) {
        return kaya.sendMessage(
          m.chat,
          { text: '⚠️ Please provide the Telegram pack URL.\nEx: .tg https://t.me/addstickers/Porcientoreal' },
          { quoted: m }
        );
      }

      if (!/^https?:\/\/t\.me\/addstickers\/[A-Za-z0-9_]+$/i.test(url)) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Invalid link! Make sure it is a Telegram sticker pack.' },
          { quoted: m }
        );
      }

      // 👤 pseudo de l'utilisateur (packname + author)
      const pushName = m.pushName || m.sender.split('@')[0] || 'User';

      const packName = url.split('/').pop();
      const botToken = '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';

      const res = await fetch(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`);
      if (!res.ok) throw new Error(`Telegram API error: ${res.status}`);

      const packData = await res.json();
      if (!packData.ok || !packData.result) throw new Error('Invalid or private pack');

      let stickers = packData.result.stickers;
      if (stickers.length > MAX_STICKERS) stickers = stickers.slice(0, MAX_STICKERS);

      await kaya.sendMessage(
        m.chat,
        { text: `📦 Pack found: ${stickers.length} stickers\n⏳ Downloading...` },
        { quoted: m }
      );

      let success = 0;

      for (let i = 0; i < stickers.length; i += BATCH_SIZE) {
        const batch = stickers.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (sticker, index) => {
          try {
            const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`);
            const fileData = await fileRes.json();
            if (!fileData.ok) return;

            const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
            const buffer = await (await fetch(fileUrl)).arrayBuffer();

            const tmpFile = {
              data: Buffer.from(buffer),
              mimetype: sticker.is_video ? 'video/mp4' : 'image/png'
            };

            // ✅ packname + author = pseudo de l'utilisateur
            const exifFilePath = await writeExif(tmpFile, {
              packname: pushName,
              author: pushName,
              categories: [sticker.emoji || '🤖']
            });

            const stickerBuffer = fs.readFileSync(exifFilePath);

            await kaya.sendMessage(m.chat, {
              sticker: stickerBuffer
            });

            fs.unlinkSync(exifFilePath);
            success++;

          } catch (err) {
            console.error(`❌ Sticker error ${i + index}:`, err);
          }
        }));

        await delay(BATCH_DELAY);
      }

      await kaya.sendMessage(
        m.chat,
        { text: `✅ Stickers sent: ${success}/${stickers.length}` },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ tg command error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ Unable to download the pack. Check the URL or pack visibility.' },
        { quoted: m }
      );
    }
  }
};