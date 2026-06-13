import { sendWithBotImage, getBotName } from '../system/botAssets.js';
import { buildRepoMessage } from '../system/repoTemplate.js';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'repo',
  aliases: ['github', 'source', 'code'],
  category: 'General',
  description: 'Show bot repository information',

  run: async (sock, m, args) => {

    try {
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

      await sendWithBotImage(
        sock,
        m.chat,
        {
          caption: repoText + "\n\n" + buildRepoMessage(),
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.log('❌ REPO ERROR:', err);

      return sock.sendMessage(
        m.chat,
        {
          text: '❌ Repo command error.'
        },
        { quoted: m }
      );
    }
  }
};