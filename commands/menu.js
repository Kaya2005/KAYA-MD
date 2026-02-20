import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { contextInfo } from '../system/contextInfo.js';
import { getBotImage, getBotName, BOT_VERSION } from '../system/botAssets.js';
import { buildMenuText, buildMenuCategoryText } from '../system/menuTemplate.js';

// ===================== PRIVATE MODE FILE =====================
const dataDir = path.join(process.cwd(), 'data');
const privateFile = path.join(dataDir, 'privateMode.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Charger le mode private depuis le fichier JSON au démarrage
if (!global.privateMode) {
  if (fs.existsSync(privateFile)) {
    try {
      global.privateMode = JSON.parse(fs.readFileSync(privateFile, 'utf-8')).private;
    } catch {
      global.privateMode = false; // fallback
    }
  } else {
    global.privateMode = false;
  }
}

// ===================== FORMAT UPTIME =====================
function formatUptime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${d}d ${h}h ${m}m ${s}s`;
}

// ===================== LOAD COMMANDS =====================
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
      categories[cat].push(cmd.name.toLowerCase());
    } catch (err) {
      console.error('MENU LOAD ERROR:', file, err.message);
    }
  }

  return categories;
}

// ===================== MENU COMMAND =====================
export default {
  name: 'menu',
  category: 'General',
  description: 'Menu command',

  async execute(Kaya, m) {
    const mode = global.privateMode ? 'PRIVATE' : 'PUBLIC'; // ✅ reflète le vrai état
    const prefix = config.PREFIX || '.';

    // Mention utilisateur
    const userId = m.sender;
    const userNumber = userId.split('@')[0];
    const user = `@${userNumber}`;

    const categories = await loadCommands();
    const sortedCats = Object.keys(categories).sort(
      (a, b) => categories[b].length - categories[a].length
    );

    // ===================== BUILD MENU =====================
    let menuList = '';
    for (const cat of sortedCats) {
      menuList +=
        buildMenuCategoryText({
          cat,
          cmds: categories[cat].map(c => `${prefix}${c}`)
        }) + '\n\n';
    }

    const totalCmds = Object.values(categories).reduce((a, b) => a + b.length, 0);

    const menuText = buildMenuText({
      user,
      userId,
      prefix,
      mode,
      totalCmds,
      active: 1,
      menuList
    });

    // ===================== IMAGE LOGIC =====================
    let thumbnailBuffer;
    const botImage = getBotImage();

    if (botImage?.type === 'buffer') {
      thumbnailBuffer = botImage.value;
    }

    if (!thumbnailBuffer) {
      try {
        const localPath = path.join(process.cwd(), 'system', 'bot.jpg');
        if (fs.existsSync(localPath)) {
          thumbnailBuffer = fs.readFileSync(localPath);
        }
      } catch (e) {
        console.warn('⚠️ bot.jpg fallback failed');
      }
    }

    const externalAdReply = {
      title: `WELCOME TO ${getBotName()}`,
      body: `${totalCmds} COMMANDS • v${BOT_VERSION}`,
      mediaType: 1,
      renderLargerThumbnail: true,
      thumbnail: thumbnailBuffer
    };

    // ===================== SEND MENU =====================
    await Kaya.sendMessage(
      m.chat,
      {
        text: menuText,
        contextInfo: {
          ...contextInfo,
          externalAdReply,
          mentionedJid: [userId]
        }
      },
      { quoted: m }
    );
  }
};