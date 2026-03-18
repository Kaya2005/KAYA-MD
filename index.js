//index.js
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pino from 'pino';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import config from './config.js';
import { connectionMessage } from './system/botAssets.js';
import { checkUpdate } from './system/updateChecker.js';
import handleCommand, { smsg, loadCommands, commands, handleParticipantUpdate } from './handler.js';

import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!globalThis.crypto?.subtle) globalThis.crypto = crypto.webcrypto;

global.owner ??= Array.isArray(config.OWNERS) ? config.OWNERS : [config.OWNERS];
global.SESSION_ID ??= config.SESSION_ID;
global.botModes ??= { typing: false, recording: false, autoreact: { enabled: false }, autoread: { enabled: false } };
global.botStartTime = Date.now();

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// 🔹 Charger session base64
async function loadSessionFromBase64() {
  if (!global.SESSION_ID?.startsWith('KAYA==')) return;
  if (fs.existsSync(credsPath)) return;
  const base64 = global.SESSION_ID.replace('KAYA==', '');
  fs.writeFileSync(credsPath, Buffer.from(base64, 'base64'));
  console.log('CONNECTED');
}

// 🔹 Core Bot Start
async function startBot() {
  await loadSessionFromBase64();

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Safari'),
    printQRInTerminal: false
  });

  sock.decodeJid = jid => {
    if (!jid) return jid;
    const d = /:\d+@/gi.test(jid) ? jidDecode(jid) : {};
    return d.user && d.server ? `${d.user}@${d.server}` : jid;
  };

  await loadCommands();
  console.log(chalk.cyan(`📂 Commandes chargées : ${Object.keys(commands).length}`));

  // 🔹 Connection
sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
  if (connection === 'open') {
    console.log(chalk.green('✅ KAYA-MD CONNECTÉ'));
    const jid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
    sock.sendMessage(jid, { text: connectionMessage() }).catch(() => {});
    checkUpdate(sock).catch(() => {});

    // 🔹 Après ouverture, on active le traitement normal des messages
    global.startupDone = true;
  }

  if (connection === 'close') {
    const reason = lastDisconnect?.error?.output?.statusCode;
    console.log('❌ Déconnecté :', reason);
    if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
  }
});

// 🔥 ULTRA OPTIMISÉ
sock.ev.on('messages.upsert', async ({ messages }) => {
  if (!messages?.length) return;

  // 🔹 IGNORER les messages anciens tant que startupDone n'est pas activé
  if (!global.startupDone) return;

  messages.forEach(msg => {
    if (!msg.message) return;

    const m = smsg(sock, msg);

    // ⚡ priorité commandes
    if (m.body?.startsWith(config.PREFIX)) {
      handleCommand(sock, m).catch(console.error);
    } else {
      setTimeout(() => {
        handleCommand(sock, m).catch(console.error);
      }, 100);
    }
  });
});

sock.ev.on('group-participants.update', update =>
  handleParticipantUpdate(sock, update).catch(() => {})
);

sock.ev.on('creds.update', saveCreds);

return sock;
}

startBot();
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);