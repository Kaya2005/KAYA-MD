// ==================== system/botStatus.js ====================
import fs from 'fs';
import path from 'path';
import { handleAutoread } from '../commands/autoread.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const botModesPath = path.join(dataDir, 'botModes.json');

// ================== Charger les modes ==================
export function loadBotModes() {
  if (!fs.existsSync(botModesPath)) {
    fs.writeFileSync(
      botModesPath,
      JSON.stringify({
        typing: false,
        recording: false,
        autoreact: { enabled: false },
        autoread: { enabled: false }
      }, null, 2)
    );
  }
  const data = JSON.parse(fs.readFileSync(botModesPath, 'utf-8'));
  global.botModes = { ...global.botModes, ...data };
  return global.botModes;
}

// ================== Sauvegarder les modes ==================
export function saveBotModes(modes) {
  global.botModes = { ...global.botModes, ...modes };
  fs.writeFileSync(botModesPath, JSON.stringify(global.botModes, null, 2));
  console.log('✅ botModes sauvegardé');
}

// ================== Gestion des modes en live ==================
const defaultRandomEmoji = () =>
  ['❤️','😂','🔥','👍','🎉','💯','😍','🤖'][Math.floor(Math.random() * 8)];

export async function handleBotModes(sock, m, randomEmoji = defaultRandomEmoji) {
  try {
    if (!m?.message) return;

    // TYPING / RECORDING
    if (global.botModes.typing) await sock.sendPresenceUpdate('composing', m.chat);
    if (global.botModes.recording) await sock.sendPresenceUpdate('recording', m.chat);

    // AUTOREACT
    if (global.botModes.autoreact?.enabled) {
      await sock.sendMessage(m.chat, { react: { text: randomEmoji(), key: m.key } }).catch(() => {});
    }

    // AUTOREAD
    if (global.botModes.autoread?.enabled) {
      await handleAutoread(sock, m).catch(() => {});
    }

  } catch (err) {
    console.error('❌ BotModes error:', err);
  }
}