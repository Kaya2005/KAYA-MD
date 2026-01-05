// ================= commands/ping.js =================
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'ping',
  alias: [],
  category: 'General',
  description: '🏓 Check the bot latency and status',
  ownerOnly: false,
  group: false,

  async run(kaya, m, args) {
    try {
      const start = Date.now();

      // Temporary "typing" message
      const tempMsg = await kaya.sendMessage(
        m.chat,
        { text: '⏳ Calculating latency...' },
        { quoted: m }
      );

      const end = Date.now();
      const latency = end - start;

      const uptimeSeconds = process.uptime();
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = Math.floor(uptimeSeconds % 60);

      const response = `
╭───〔 🏓 PONG 〕───╮
│ ✅ Status   : *KAYA-MD* is online and ready!
│ ⏱️ Latency : *${latency} ms*
│ ⚡ Uptime  : *${hours}h ${minutes}m ${seconds}s*
│ 🚀 Performance : *Ultra fast* ⚡
╰───────────────────╯
      `.trim();

      // Edit the previous message with the final result (if supported)
      await kaya.sendMessage(
        m.chat,
        {
          text: response,
          contextInfo: { ...contextInfo, mentionedJid: [m.sender] }
        },
        { quoted: m }
      );

      // Optional: delete the temporary message after sending result
      // await kaya.deleteMessage(m.chat, { id: tempMsg.key.id, remoteJid: m.chat });

    } catch (err) {
      console.error('❌ Ping command error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '⚠️ Unable to calculate latency.', contextInfo },
        { quoted: m }
      );
    }
  }
};