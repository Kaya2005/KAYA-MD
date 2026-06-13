import { sendWithBotImage, getBotName } from '../system/botAssets.js';
import { buildRepoMessage } from '../system/repoTemplate.js';

export default {
  name: 'repo',
  aliases: ['github', 'source', 'code'],
  category: 'General',
  description: 'Show bot repository information',

  async execute(Kaya, m) {
    const botName = getBotName();

    const repoText =
`╭━━━〔 🤖 *${botName} INFO* 〕━━━⬣

📦 *Repository*
🔗 https://github.com/kaya-md/KAYA-BOT

🧠 *Session ID*
🔗 https://kaya-session-id.vercel.app

🚀 *Free Deployment Server*
✔ Katabump Panel (Free Hosting)
🔗 https://dashboard.katabump.com/auth/login#483bf6

╰━━━━━━━━━━━━━━━━━━━━⬣`;

    try {
      await sendWithBotImage(
        Kaya,
        m.chat,
        {
          caption: repoText + "\n\n" + buildRepoMessage(),
          contextInfo: {
            mentionedJid: [m.sender]
          }
        },
        { quoted: m }
      );

    } catch (err) {
      console.log('❌ REPO COMMAND ERROR:', err);

      // fallback si image système casse
      await Kaya.sendMessage(
        m.chat,
        {
          text: repoText + "\n\n" + buildRepoMessage()
        },
        { quoted: m }
      );
    }
  }
};