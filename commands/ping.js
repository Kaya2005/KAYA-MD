import config from '../config.js';
import { BOT_NAME, sendWithBotImage } from '../system/botAssets.js';

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

  run: async (kaya, m) => {
    try {
      const start = Date.now();

      await kaya.sendMessage(m.chat, { text: '🏓 Pong...' }, { quoted: m });

      const latency = Date.now() - start;
      const uptime = formatUptime(process.uptime());
      const mode = config.public ? 'PUBLIC' : 'PRIVATE';

      const message = `
╔═━────────────━═╗
       ${BOT_NAME}
╚═━────────────━═╝

⚡ Status   : Online & Ready
⏱️ Latency  : ${latency} ms
⌛ Uptime   : ${uptime}
🔓 Mode     : ${mode}

══════════════════
      `.trim();

      await sendWithBotImage(
        kaya,
        m.chat,
        {
          caption: message,
          contextInfo: { mentionedJid: [m.sender] }
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ ping.js error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '⚠️ Unable to check latency. Please try again.' },
        { quoted: m }
      );
    }
  }
};