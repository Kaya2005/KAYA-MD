// index.js

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import pino from 'pino';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

process.setMaxListeners(0);

import config from './config.js';

import { connectionMessage } from './system/botAssets.js';
import { checkUpdate } from './system/updateChecker.js';

import handleCommand, {
  smsg,
  loadCommands,
  commands,
  handleParticipantUpdate
} from './handler.js';

import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

// ========================================
// PATHS
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// GLOBALS
// ========================================

if (!globalThis.crypto?.subtle) {
  globalThis.crypto = crypto.webcrypto;
}

global.SESSION_ID ??= config.SESSION_ID;

global.botModes ??= {
  typing: false,
  recording: false,
  autoreact: { enabled: false },
  autoread: { enabled: false }
};

global.botStartTime = Date.now();
global.startupDone = false;
global.isRestarting ??= false;

// ========================================
// SESSION
// ========================================

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// ========================================
// LOAD BASE64 SESSION
// ========================================

async function loadSessionFromBase64() {
  try {
    if (!global.SESSION_ID?.startsWith('KAYA==')) return;
    if (fs.existsSync(credsPath)) return;

    const base64 = global.SESSION_ID.replace('KAYA==', '');

    fs.writeFileSync(
      credsPath,
      Buffer.from(base64, 'base64')
    );

    console.log(chalk.green('KAYA BOT CONNECTED✅️');
  } catch (e) {
    console.error('Erreur session :', e);
  }
}

// ========================================
// START BOT
// ========================================

async function startBot() {
  try {

    if (global.sock) {
      try {
        global.sock.ws.close();
      } catch {}
    }

    await loadSessionFromBase64();

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS('Safari'),
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      fireInitQueries: false,
      generateHighQualityLinkPreview: false,
      defaultQueryTimeoutMs: 0
    });

    global.sock = sock;

    sock.decodeJid = jid => {
      if (!jid) return jid;

      const d = /:\d+@/gi.test(jid) ? jidDecode(jid) : {};

      return (d.user && d.server)
        ? `${d.user}@${d.server}`
        : jid;
    };

    sock.ev.removeAllListeners('presence.update');

    await loadCommands();

    console.log(
      chalk.cyan(`📂 Commandes chargées : ${Object.keys(commands).length}`)
    );

    // ====================================
    // CONNECTION UPDATE
    // ====================================

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      try {

        if (connection === 'open') {
          console.log(chalk.green('✅ KAYA-MD CONNECTÉ'));

          const jid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

          await sock.sendMessage(jid, {
            text: connectionMessage()
          }).catch(() => {});

          await checkUpdate(sock).catch(() => {});

          global.startupDone = true;
        }

        if (connection === 'close') {

          const reason = lastDisconnect?.error?.output?.statusCode;

          console.log(chalk.red('❌ Déconnecté :'), reason);

          if (
            reason !== DisconnectReason.loggedOut &&
            reason !== DisconnectReason.badSession
          ) {

            if (!global.isRestarting) {
              global.isRestarting = true;

              setTimeout(async () => {
                try {
                  await startBot();
                } finally {
                  global.isRestarting = false;
                }
              }, 5000);
            }
          }
        }

      } catch (e) {
        console.error(e);
      }
    });

    // ====================================
    // ANTI SPAM
    // ====================================

    const processing = new Set();

    // ====================================
    // MESSAGES
    // ====================================

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {

        if (type !== 'notify') return;
        if (!global.startupDone) return;

        for (const msg of messages) {

          try {

            if (!msg?.message) continue;
            if (!msg.key?.remoteJid) continue;

            if (msg.key.remoteJid === 'status@broadcast') continue;
            if (msg.key.remoteJid.includes('broadcast')) continue;
            if (msg.message?.protocolMessage) continue;

            const m = smsg(sock, msg);
            if (!m.body) continue;

            if (processing.has(m.sender)) continue;
            processing.add(m.sender);

            try {

              // =====================================
              // 🔥 FROM ME = TOUJOURS EXECUTÉ
              // =====================================
              if (msg.key.fromMe) {
                await handleCommand(sock, m);
                continue;
              }

              // =====================================
              // USERS
              // =====================================
              if (m.body.startsWith(config.PREFIX)) {

                await handleCommand(sock, m);

              } else {

                setImmediate(() => {
                  handleCommand(sock, m).catch(() => {});
                });

              }

            } finally {
              processing.delete(m.sender);
            }

          } catch (e) {
            console.error(e);
          }

        }

      } catch (e) {
        console.error(e);
      }
    });

    // ====================================
    // GROUP PARTICIPANTS
    // ====================================

    sock.ev.on('group-participants.update', async update => {
      try {
        await handleParticipantUpdate(sock, update);
      } catch {}
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;

  } catch (e) {

    console.error('Erreur startBot :', e);

    if (!global.isRestarting) {
      global.isRestarting = true;

      setTimeout(async () => {
        try {
          await startBot();
        } finally {
          global.isRestarting = false;
        }
      }, 5000);
    }
  }
}

// ========================================
// CLEAN MEMORY
// ========================================

setInterval(() => {
  if (global.gc) global.gc();
}, 300000);

// ========================================
// START
// ========================================

startBot();

// ========================================
// ERRORS
// ========================================

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);