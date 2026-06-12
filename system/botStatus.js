// ==================== system/botStatus.js ====================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const botModesPath = path.join(dataDir, 'botModes.json');

// ================== Charger les modes ==================
export function loadBotModes() {
  // Création automatique si absent
  if (!fs.existsSync(botModesPath)) {
    fs.writeFileSync(
      botModesPath,
      JSON.stringify({
        typing: false,
        recording: false,
        autoreact: { enabled: false },
        antilink: {},
        antispam: {},
        antitag: {}
      }, null, 2)
    );
  }

  const data = JSON.parse(fs.readFileSync(botModesPath, 'utf-8'));

  // Structure sécurisée anti-reset
  global.botModes = {
    typing: false,
    recording: false,
    autoreact: { enabled: false },

    // 🔹 Données persistantes des commandes
    antilink: global.antiLinkGroups ?? data.antilink ?? {},
    antispam: global.antiSpamGroups ?? data.antispam ?? {},
    antitag: global.antiTagGroups ?? data.antitag ?? {},

    // 🔹 Autres données du fichier
    ...data
  };

  return global.botModes;
}

// ================== Sauvegarder les modes ==================
export function saveBotModes(modes) {
  global.botModes = {
    ...global.botModes,
    ...modes
  };

  fs.writeFileSync(botModesPath, JSON.stringify(global.botModes, null, 2));
  console.log('✅ botModes sauvegardé');
}

// ================== Gestion des modes en live ==================
const defaultRandomEmoji = () =>
  ['❤️','😂','🔥','👍','🎉','💯','😍','🤖'][Math.floor(Math.random() * 8)];

export async function handleBotModes(sock, m, randomEmoji = defaultRandomEmoji) {
  try {
    if (!m?.message) return;

    // ================= TYPING =================
    if (global.botModes.typing) {
      await sock.sendPresenceUpdate('composing', m.chat);
    }

    // ================= RECORDING =================
    if (global.botModes.recording) {
      await sock.sendPresenceUpdate('recording', m.chat);
    }

    // ================= AUTOREACT =================
    if (global.botModes.autoreact?.enabled) {
      await sock.sendMessage(m.chat, {
        react: { text: randomEmoji(), key: m.key }
      }).catch(() => {});
    }

    // ⚠️ IMPORTANT :
    // antilink, antispam & antitag
    // utilisent leur propre fonction detect()
    // botModes sert uniquement à stocker leur état
    // donc on ne les gère PAS ici volontairement

  } catch (err) {
    console.error('❌ BotModes error:', err);
  }
}