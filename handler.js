// ==================== handler.js ====================
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import config from './config.js';
import { handleMention } from './system/mentionHandler.js';
import {
  storeMessage,
  downloadContentFromMessage,
  uploadImage,
  handleAutoread,
  handleBotModes
} from './system/initModules.js';
import checkAdminOrOwner from './system/checkAdmin.js';
import { WARN_MESSAGES } from './system/warnMessages.js';
import { handleMenuReply } from './commands/menu.js';

// ================== 🚀 Startup Grace ==================
global.botStartTime ??= Date.now();
global.startupGrace ??= { enabled: true, duration: 20000 };
setTimeout(() => {
  global.startupGrace.enabled = false;
  console.log('⚡ Startup grace terminé');
}, global.startupGrace.duration);

// ================== 🔹 Gestion persistante des globals ==================
const SETTINGS_FILE = './data/settings.json';
let savedSettings = {};
try {
  savedSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
} catch {
  console.log('⚠️ Aucune sauvegarde existante, utilisation des valeurs par défaut.');
}

// ================== 🔹 Initialisation sécurisée ==================
const commands = {};
global.groupThrottle ??= savedSettings.groupThrottle || {};
global.userThrottle ??= new Set(savedSettings.userThrottle || []);
global.disabledGroups ??= new Set(savedSettings.disabledGroups || []);
global.botModes ??= savedSettings.botModes || { typing: false, recording: false, autoread: { enabled: false } };

// ================== 🔹 Globals AntiBot ==================
global.antiBotGroups ??= {};
global.botWarns ??= {};
global.messageRate ??= {};

// ================== 🔹 Sauvegarde avec debounce ==================
let saveTimeout;
function saveSettings() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const data = {
      groupThrottle: global.groupThrottle,
      userThrottle: Array.from(global.userThrottle),
      disabledGroups: Array.from(global.disabledGroups),
      botModes: global.botModes
    };
    fs.writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), () => {});
  }, 2000);
}

// ================== 🔹 Wrappers groupes ==================
global.disableGroup = chatId => { global.disabledGroups.add(chatId); saveSettings(); };
global.enableGroup = chatId => { global.disabledGroups.delete(chatId); saveSettings(); };

// ================== 📂 Chargement commandes (UNE FOIS) ==================
let commandsLoaded = false;
const loadCommands = async (dir = './commands') => {
  if (commandsLoaded) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await loadCommands(fullPath);
      continue;
    }
    if (!file.endsWith('.js')) continue;
    const module = await import(pathToFileURL(fullPath).href);
    const cmd = module.default || module;
    if (cmd?.name) commands[cmd.name.toLowerCase()] = cmd;
  }
  global.participantCommands = Object.values(commands).filter(cmd => typeof cmd.participantUpdate === 'function');
  commandsLoaded = true;
};

// ================== 🧠 smsg ==================
const smsg = (sock, m) => {
  if (!m?.message) return {};
  const msg = m.message;
  const body =
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    '';
  return {
    ...m,
    body,
    chat: m.key.remoteJid,
    id: m.key.id,
    fromMe: m.key.fromMe,
    sender: m.key.fromMe ? sock.user.id : (m.key.participant || m.key.remoteJid || ''),
    isGroup: m.key.remoteJid.endsWith('@g.us'),
    mentionedJid: msg.extendedTextMessage?.contextInfo?.mentionedJid || []
  };
};

// ================== SIMULATION TYPING / RECORDING ==================
const typingSessions = new Map();
async function simulateTypingRecording(sock, chatId) {
  if (!chatId || typingSessions.has(chatId)) return;
  const timer = setInterval(async () => {
    try {
      if (global.botModes.typing) await sock.sendPresenceUpdate('composing', chatId);
      if (global.botModes.recording) await sock.sendPresenceUpdate('recording', chatId);
    } catch {}
  }, 30000);
  typingSessions.set(chatId, timer);
  setTimeout(() => {
    clearInterval(timer);
    typingSessions.delete(chatId);
  }, 120000);
}

// ================== 👰 HANDLER COMMANDES ==================
async function handleCommand(sock, mRaw) {
  try {
    if (!mRaw?.message) return;
    const m = smsg(sock, mRaw);
    const body = m.body?.trim();
    if (!body) return;

    // MENU INTERACTIF
    if (await handleMenuReply(sock, m)) return;

    const PREFIX = global.PREFIX || config.PREFIX;
    let isCommand = false, commandName = '', args = [];

    if (global.allPrefix) {
      const text = body.replace(/^[^a-zA-Z0-9]+/, '').trim();
      const parts = text.split(/\s+/);
      const potential = parts.shift()?.toLowerCase();
      if (commands[potential]) { isCommand = true; commandName = potential; args = parts; }
    } else if (body.startsWith(PREFIX)) {
      const parts = body.slice(PREFIX.length).trim().split(/\s+/);
      const potential = parts.shift()?.toLowerCase();
      if (commands[potential]) { isCommand = true; commandName = potential; args = parts; }
    }

    // Admin / Owner
    if (m.isGroup && isCommand) {
      const check = await checkAdminOrOwner(sock, m.chat, m.sender);
      m.isAdmin = check.isAdmin;
      m.isOwner = check.isOwner;
    } else { m.isAdmin = false; m.isOwner = false; }

    const ownerCheck = m.isOwner || m.fromMe;

    // Modes & autoread
    await handleBotModes(sock, m);
    if (global.botModes?.autoread?.enabled) await handleAutoread(sock, m);

    // Mode privé
    if (global.privateMode && !ownerCheck && isCommand)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.PRIVATE_MODE }, { quoted: mRaw });

    // User banni
    if (global.bannedUsers?.has(m.sender?.toLowerCase()) && isCommand)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BANNED_USER }, { quoted: mRaw });

    // Inbox bloqué
    if (global.blockInbox && !m.isGroup && !ownerCheck && isCommand && commands[commandName])
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BLOCK_INBOX }, { quoted: mRaw });

    // Messages non-commandes (AntiBot / AntiLink / AntiSpam / AntiTag)
    if (!isCommand && m.isGroup) {
      if (global.startupGrace.enabled) return;
      try {
        const checks = [];
        const g = m.chat;
        if (global.antiLinkGroups?.[g]?.enabled && commands.antilink?.detect) checks.push(commands.antilink.detect(sock, m));
        if (global.antiBotGroups?.[g]?.enabled && commands.antibot?.detect) checks.push(commands.antibot.detect(sock, m));
        if (global.antiSpamGroups?.[g]?.enabled && commands.antispam?.detect) checks.push(commands.antispam.detect(sock, m));
        if (global.antiTagGroups?.[g]?.enabled && commands.antitag?.detect) checks.push(commands.antitag.detect(sock, m));
        if (global.antiStatusGroups?.[g]?.enabled && commands.antistatus?.detect) checks.push(commands.antistatus.detect(sock, m));

        // ✅ Execute en parallèle mais non-bloquant
        void Promise.allSettled(checks);

        if (!m.isGroup && (global.botModes.typing || global.botModes.recording))
          simulateTypingRecording(sock, m.chat);

        // Mentions en mémoire (lecture une seule fois)
        if (!global._mentionState) {
          try { global._mentionState = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'mention.json'))); } catch { global._mentionState = { enabled: false }; }
        }
        if (global._mentionState.enabled && m.mentionedJid.includes(sock.user.id))
          await handleMention(sock, m);

      } catch (err) { console.error('❌ NE COMMANDES error:', err); }
      return;
    }

    // Antidelete
    if (commands.antidelete?.storeMessage && commands.antidelete.loadConfig?.().enabled)
      await commands.antidelete.storeMessage(sock, mRaw).catch(() => {});

    // Groupe désactivé
    if (m.isGroup && global.disabledGroups.has(m.chat) && !ownerCheck)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BOT_OFF }, { quoted: mRaw });

    // Throttle groupe
    if (m.isGroup) {
      const now = Date.now();
      const delay = isCommand ? 300 : 1000;
      if (!global.startupGrace.enabled && global.groupThrottle[m.chat] && now - global.groupThrottle[m.chat] < delay) return;
      global.groupThrottle[m.chat] = now;
    }

    // Exécution commande
    const cmd = commands[commandName];
    if (!cmd) return;
    if (cmd.group && !m.isGroup) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.GROUP_ONLY }, { quoted: mRaw });
    if (cmd.admin && !m.isAdmin && !m.isOwner) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.ADMIN_ONLY(commandName) }, { quoted: mRaw });
    if (cmd.ownerOnly && !ownerCheck) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.OWNER_ONLY(commandName) }, { quoted: mRaw });

    if (cmd.execute) await cmd.execute(sock, m, args, storeMessage).catch(() => {});
    else if (cmd.run) await cmd.run(sock, m, args, storeMessage).catch(() => {});

    saveSettings();
  } catch (err) { console.error('❌ Handler error:', err); }
}

// ================== 👥 Participant update ==================
async function handleParticipantUpdate(sock, update) {
  for (const cmd of global.participantCommands)
    await cmd.participantUpdate(sock, update).catch(() => {});
}

// ================== EXPORT ==================
export { loadCommands, commands, smsg, handleParticipantUpdate, saveSettings };
export default handleCommand;