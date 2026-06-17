import fs from 'fs';
import path from 'path';
import { getBotImage, getBotName } from '../system/botAssets.js';
import { getContextInfo as baseContextInfo } from '../system/contextInfo.js';

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${h}h ${m}m ${s}s`;
}

export default {
  name: 'ping',
  aliases: [],
  category: 'General',
  description: '🏓 Check bot latency and status',
  ownerOnly: false,
  group: false,

  run: async (Kaya, m) => {
    try {
      const start = Date.now();
      const latency = Date.now() - start;
      const uptime = formatUptime(process.uptime());

      let thumbnailBuffer;
      const botImage = getBotImage();

      if (botImage?.type === 'buffer') {
        thumbnailBuffer = botImage.value;
      }

      if (!thumbnailBuffer) {
        try {
          const localPath = path.join(process.cwd(), 'system', 'bot.jpg');

          if (fs.existsSync(localPath)) {
            thumbnailBuffer = fs.readFileSync(localPath);
          }
        } catch {
          console.warn('⚠️ bot.jpg fallback failed');
        }
      }

      const externalAdReply = {
        title: `🏓 PONG • ${latency}ms`,
        body: `${getBotName()} • ⏳ ${uptime}`,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        thumbnail: thumbnailBuffer
      };

      const contextInfo = {
        ...(typeof baseContextInfo === 'function'
          ? baseContextInfo()
          : baseContextInfo),
        externalAdReply,
        mentionedJid: [m.sender]
      };

      await Kaya.sendMessage(
        m.chat,
        {
          text: '‎',
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ ping.js error:', err);

      await Kaya.sendMessage(
        m.chat,
        { text: '⚠️ Unable to check latency.' },
        { quoted: m }
      );
    }
  }
};