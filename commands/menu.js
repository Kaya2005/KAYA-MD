import fs from 'fs';
import path from 'path';
import { contextInfo } from '../system/contextInfo.js';
import { getBotImage } from '../system/botAssets.js';
import config from '../config.js';
import { buildMenuText, buildMenuCategoryText } from '../system/menuTemplate.js';

function formatUptime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${d}d ${h}h ${m}m ${s}s`;
}

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
      console.error('MENU LOAD ERROR:', file, err.message);
    }
  }
  return categories;
}

export default {
  name: 'menu',
  category: 'General',
  description: 'Styled interactive menu',

  async execute(Kaya, m) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('en-GB');
    const uptime = formatUptime(Date.now() - global.botStartTime);
    const mode = config.public ? 'PUBLIC' : 'PRIVATE';
    const user = m.sender.split('@')[0];

    const categories = await loadCommands();
    const sortedCats = Object.keys(categories).sort((a, b) => categories[b].length - categories[a].length);

    let menuList = '';
    sortedCats.forEach((cat, i) => {
      menuList += `│ ${i + 1}. ${cat} MENU\n`;
    });

    const totalCmds = Object.values(categories).reduce((a, b) => a + b.length, 0);

    const menuText = buildMenuText({ date, user, uptime, totalCmds, mode, menuList });

    global.menuSessions[m.sender] = {
      categories: sortedCats,
      commands: categories,
    };

    const botImage = getBotImage();
    try {
      await Kaya.sendMessage(
        m.chat,
        {
          image: { url: botImage },
          caption: menuText,
          contextInfo: { ...contextInfo, mentionedJid: [m.sender] },
        },
        { quoted: m }
      );
    } catch {
      await Kaya.sendMessage(
        m.chat,
        { text: menuText, contextInfo: { ...contextInfo, mentionedJid: [m.sender] } },
        { quoted: m }
      );
    }
  },
};

export async function handleMenuReply(Kaya, m) {
  const session = global.menuSessions?.[m.sender];
  if (!session || !/^\d+$/.test(m.body?.trim())) return false;

  const index = parseInt(m.body.trim()) - 1;
  const cat = session.categories[index];
  if (!cat) return false;

  const cmds = session.commands[cat];
  const menuCatText = buildMenuCategoryText({ cat, cmds });

  await Kaya.sendMessage(
    m.chat,
    { text: menuCatText, contextInfo: { ...contextInfo, mentionedJid: [m.sender] } }
  );

  return true;
}