import { BOT_NAME, sendWithBotImage } from '../system/botAssets.js';

export default {
  name: 'repo',
  aliases: ['repository', 'script'],
  category: 'General',
  description: '📦 Show bot repository information',
  ownerOnly: false,
  group: false,

  run: async (kaya, m) => {
    try {

      const message = `
╔═━────────────━═╗
       ${BOT_NAME}
╚═━────────────━═╝

📦 *Repository*
🔗 https://github.com/kaya-md/KAYA-BOT

🧠 *Session ID*
🔗 https://kaya-session-id.vercel.app

🚀 *Free Deployment Server*
✔ Katabump Panel (Free Hosting)

🔗 https://dashboard.katabump.com/auth/login#483bf6

══════════════════
      `.trim();

      await sendWithBotImage(
        kaya,
        m.chat,
        {
          caption: message,
          contextInfo: {
            mentionedJid: [m.sender]
          }
        },
        {
          quoted: m
        }
      );

    } catch (err) {
      console.error('❌ repo.js error:', err);

      await kaya.sendMessage(
        m.chat,
        {
          text: '⚠️ Unable to fetch repository information.'
        },
        {
          quoted: m
        }
      );
    }
  }
};