// ================== CORE ==================
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pino from 'pino';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
global.menuSessions = {};
// ================== CONFIG & GLOBALS ==================
import { getBotImagePayload } from './system/botAssets.js';
import antiActu from './commands/antiChannelActu.js';
commands.antiActu = antiActu;
import config from './config.js';
import './system/globals.js';
import { loadBotModes } from './system/botStatus.js';
loadBotModes();

// ================== ASSETS & UTILS ==================
import { connectionMessage, getBotImage } from './system/botAssets.js';
import { checkUpdate } from './system/updateChecker.js';
import { loadSessionFromMega } from './system/megaSession.js';

// ================== HANDLER ==================
import handleCommand, {
  smsg,
  loadCommands,
  commands,
  handleParticipantUpdate
} from './handler.js';

// ================== BAILEYS ==================
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

// ================== PATH ==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== CRYPTO FIX ==================
if (!globalThis.crypto?.subtle) {
  globalThis.crypto = crypto.webcrypto;
}

// ================== GLOBAL CONFIG ==================
global.owner ??= [config.OWNER_NUMBER];
global.SESSION_ID ??= config.SESSION_ID;

global.botModes ??= {
  typing: false,
  recording: false,
  autoreact: { enabled: false },
  autoread: { enabled: false }
};

global.autoStatus ??= false;
global.botStartTime = Date.now();

// ================== SESSION ==================
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// ================== START BOT ==================
async function startBot() {
  try {
    // ===== Load session Mega (si existante)
    await loadSessionFromMega(credsPath);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS('Safari'),
      printQRInTerminal: false
    });

    // ================== JID NORMALIZER ==================
    sock.decodeJid = jid => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const d = jidDecode(jid) || {};
        return d.user && d.server ? `${d.user}@${d.server}` : jid;
      }
      return jid;
    };

    // ================== LOAD COMMANDS (ONCE) ==================
    await loadCommands();
    console.log(chalk.cyan(`📂 Commandes chargées : ${Object.keys(commands).length}`));


  // ================== CONNECTION ==================
sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
  try {
    if (connection === 'open') {
      console.log(chalk.green('✅ KAYA-MD CONNECTÉ'));

      // Préparer le JID pour s’envoyer le message
      const jid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
      if (!jid) throw new Error('sock.user.id non défini');

      // Récupérer le payload de l’image du bot
      const botImagePayload = getBotImage(); // { type, value }

      let imageField;
      if (botImagePayload?.type === 'url') imageField = { url: botImagePayload.value };
      else if (botImagePayload?.type === 'buffer') imageField = botImagePayload.value;

      // Envoyer le message de connexion
      if (imageField) {
        await sock.sendMessage(jid, {
          image: imageField,
          caption: connectionMessage()
        });
      } else {
        await sock.sendMessage(jid, { text: connectionMessage() });
      }

      console.log(chalk.cyan('ℹ️ Message de connexion envoyé'));
      await checkUpdate(sock);
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(chalk.red('❌ Déconnecté :'), reason);

      if (reason !== DisconnectReason.loggedOut) {
        setTimeout(startBot, 5000);
      } else {
        console.log(chalk.red('🚫 Session expirée – supprime session/creds.json'));
      }
    }
  } catch (err) {
    console.error('❌ connection.update error:', err);
  }
});
// ================== MESSAGES UPDATES ==================
sock.ev.on('messages.upsert', async ({ messages }) => {
  if (!messages?.length) return;

  // ---------------------- Pré-filtrage ----------------------
  const now = Date.now();
  const valid = messages.filter(m => {
    const jid = m.key.remoteJid;
    const msgTime = m.messageTimestamp || m.message?.timestamp || Math.floor(now / 1000);

    return (
      m?.message &&
      jid !== 'status@broadcast' &&
      jid !== '0@s.whatsapp.net' &&
      (global.startupGrace?.enabled || msgTime >= global.botStartTime / 1000)
    );
  });

  // ---------------------- Throttle par groupe ----------------------
  global.lastUpsert ??= {};
  
  for (const msg of valid) {
    try {
      const jid = msg.key.remoteJid;

      // ---------------------- Throttle simple pour groupes actifs ----------------------
      const delay = 50; // ms
      if (global.lastUpsert[jid] && now - global.lastUpsert[jid] < delay) continue;
      global.lastUpsert[jid] = now;

      // ---------------------- Cache smsg ----------------------
      global._msgCache ??= new Map();
      let mProcessed = global._msgCache.get(msg.key.id);
      if (!mProcessed) {
        mProcessed = smsg(sock, msg);
        global._msgCache.set(msg.key.id, mProcessed);
      }

      // ---------------------- Ignore messages sans texte ----------------------
      if (!mProcessed.body?.trim()) continue;

      // ---------------------- Ignore groupes désactivés ----------------------
      if (mProcessed.isGroup && global.disabledGroups.has(mProcessed.chat)) continue;

      // ---------------------- Exécution principale ----------------------
      await handleCommand(sock, mProcessed);

      // ---------------------- Nettoyage cache périodique ----------------------
      if (global._msgCache.size > 10000) global._msgCache.clear();

    } catch (err) {
      // ---------------------- Gestion Bad MAC ----------------------
      if (err.message?.includes('Bad MAC')) {
        console.warn(`⚠️ Bad MAC dans ${msg.key.remoteJid}, skipping...`);
        continue;
      }

      // ---------------------- Autres erreurs ----------------------
      console.error('❌ messages.upsert error:', err);
    }
  }
});

    // ================== GROUP EVENTS ==================
    sock.ev.on('group-participants.update', update =>
      handleParticipantUpdate(sock, update).catch(() => {})
    );

    // ================== CREDS ==================
    sock.ev.on('creds.update', saveCreds);

    return sock;

  } catch (err) {
    console.error('❌ ERREUR FATALE:', err);
    process.exit(1);
  }
}

// ================== RUN ==================
global.botStartTime = Date.now(); 
startBot();

// ================== GLOBAL ERRORS ==================
process.on('unhandledRejection', err =>
  console.error('UnhandledRejection:', err)
);
process.on('uncaughtException', err =>
  console.error('UncaughtException:', err)
);