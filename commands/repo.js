import { sendWithBotImage, getBotName } from '../system/botAssets.js';
import { buildRepoMessage } from '../system/repoTemplate.js';

export default {
  name: 'repo',
  aliases: ['github', 'source', 'code'],
  description: 'Show bot repository information',
  category: 'General',

  async execute(kaya, m) {

    const botName = getBotName();

    const repoText =
`╭━━━〔 *${botName} INFO* 〕━━━⬣

📦 *Repository*
🔗 https://github.com/kaya-md/KAYA-BOT

🧠 *Session ID*
🔗 https://kaya-session-id.vercel.app

🚀 *Free Deployment Server*
✔ Katabump Panel (Free Hosting)

🔗 https://dashboard.katabump.com/auth/login#483bf6

╰━━━━━━━━━━━━━━━━━━━━⬣`;

    await sendWithBotImage(
      kaya,
      m.chat,
      {
        caption: repoText + "\n\n" + buildRepoMessage(),
        contextInfo: {
          mentionedJid: [m.sender]
        }
      },
      { quoted: m }
    );
  }
};