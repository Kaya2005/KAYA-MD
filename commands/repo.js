// ================= commands/repo.js =================
import { getBotImage } from '../system/botAssets.js';
import { buildRepoMessage } from '../system/repoTemplate.js';

export default {
  name: 'repo',
  aliases: ['github', 'source'],
  description: 'Shows the bot GitHub repository',
  category: 'General',

  execute: async (kaya, m) => {
    await kaya.sendMessage(
      m.chat,
      {
        image: { url: getBotImage() },
        caption: buildRepoMessage()
      },
      { quoted: m }
    );
  }
};