// ==================== commands/menu.js ====================
import fs from 'fs';
import path from 'path';
import { contextInfo } from '../system/contextInfo.js';
import { BOT_NAME, BOT_SLOGAN, getBotImage } from '../system/botAssets.js';
import config from '../config.js';

// ===================== FORMAT UPTIME =====================
function formatUptime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${d}j ${h}h ${m}m ${s}s`;
}

// ===================== CHARGER COMMANDES =====================
async function loadCommands() {
  const commandsDir = path.join(process.cwd(), 'commands');
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

  const categories = {};

  for (const file of files) {
    try {
      const cmd = (await import(`./${file}`)).default;
      if (!cmd?.name) continue;

      const cat = (cmd.category || 'General').toUpperCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`.${cmd.name}`);
    } catch (err) {
      console.error('Erreur load command:', file, err.message);
    }
  }

  return categories;
}

export default {
  name: 'menu',
  description: 'Affiche le menu complet du bot',

  async execute(Kaya, m) {
    const now = new Date();
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('fr-FR');
    const uptime = formatUptime(Date.now() - global.botStartTime);
    const mode = config.public ? 'PUBLIC' : 'PRIVÉ';
    const user = m.sender.split('@')[0];

    const categories = await loadCommands();
    const totalCmds = Object.values(categories).reduce((a, b) => a + b.length, 0);

    // ===================== HEADER =====================
    let menuText = `
╭─────────────────────
│       【  BOT INFO 】
│
│  🏷️ BOT    : ${BOT_NAME}
│  👤 USER   : @${user}
│  ⏰ TIME   : ${time}
│  📅 DATE   : ${date}
│  ⌛ UPTIME : ${uptime}
│  📦 CMDS  : ${totalCmds}
│  ⚙️ MODE   : ${mode}
╰─────────────────────
`;

    // ===================== MENUS PAR CATÉGORIE =====================
    // Tri décroissant par nombre de commandes
    const sortedCats = Object.keys(categories).sort(
      (a, b) => categories[b].length - categories[a].length
    );

    for (const cat of sortedCats) {
      const cmds = categories[cat];
      menuText += `
『 *\`${cat} 𝐌𝐄𝐍𝐔\`* 』
╭─────────────────────
│ ${cmds.join('\n│ ')}
╰─────────────────────
`;
    }

    menuText += `\n${BOT_SLOGAN}`;

    // ===================== ENVOI =====================
    await Kaya.sendMessage(
      m.chat,
      {
        image: { url: getBotImage() },
        caption: menuText,
        contextInfo: {
          ...contextInfo,
          mentionedJid: [m.sender],
        },
      }
    );
  },
};