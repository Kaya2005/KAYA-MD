import config from '../config.js';
import { sendWithBotImage } from '../system/botAssets.js';
import { buildAliveMessage } from '../system/botAliveTemplate.js';

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default {
  name: 'alive',
  description: 'Shows that the bot is online',
  category: 'General',

  run: async (kaya, m) => {
    try {
      const now = new Date();

      const message = buildAliveMessage({
        mode: config.public ? 'PUBLIC' : 'PRIVATE',
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: now.toLocaleDateString('en-US'),
        uptime: formatUptime(process.uptime())
      });

      await sendWithBotImage(
        kaya,
        m.chat,
        { caption: message },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Error alive.js :', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ Unable to check bot status.' },
        { quoted: m }
      );
    }
  }
};