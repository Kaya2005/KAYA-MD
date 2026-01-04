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

// ================== 🔹 Gestion persistante des globals ==================
const SETTINGS_FILE = './data/settings.json';
let savedSettings = {};
try {
  savedSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
} catch {
  console.log('Aucune sauvegarde existante, utilisation des valeurs par défaut.');
}

// ================== 🔹 Initialisation sécurisée ==================
const commands = {};
global.groupThrottle ??= savedSettings.groupThrottle || {};
global.userThrottle ??= new Set(savedSettings.userThrottle || []);
global.disabledGroups ??= new Set(savedSettings.disabledGroups || []);
global.botModes ??= savedSettings.botModes || {
  typing: false,
  recording: false,
  autoread: { enabled: false }
};

// ================== 🔹 Sauvegarde avec debounce (SAFE) ==================
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
    fs.writeFile(
      SETTINGS_FILE,
      JSON.stringify(data, null, 2),
      () => {}
    );
  }, 2000);
}

// ================== 🔹 Wrappers groupes ==================
global.disableGroup = chatId => {
  global.disabledGroups.add(chatId);
  saveSettings();
};
global.enableGroup = chatId => {
  global.disabledGroups.delete(chatId);
  saveSettings();
};

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

    if (cmd?.name) {
      commands[cmd.name.toLowerCase()] = cmd;
    }
  }

  commandsLoaded = true;
};

// ❌ IMPORTANT : NE PAS auto-load ici
// await loadCommands();  <-- SUPPRIMÉ VOLONTAIREMENT

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
    sender: m.key.fromMe
      ? sock.user.id
      : (m.key.participant || m.key.remoteJid || ''),
    isGroup: m.key.remoteJid.endsWith('@g.us'),
    mentionedJid: msg.extendedTextMessage?.contextInfo?.mentionedJid || []
  };
};

// ================== SIMULATION TYPING / RECORDING (ANTI CRASH) ==================
const typingSessions = new Map();

async function simulateTypingRecording(sock, chatId) {
  if (!chatId) return;
  if (typingSessions.has(chatId)) return;

  const timer = setInterval(async () => {
    try {
      if (global.botModes.typing)
        await sock.sendPresenceUpdate('composing', chatId);
      if (global.botModes.recording)
        await sock.sendPresenceUpdate('recording', chatId);
    } catch {}
  }, 30000);

  typingSessions.set(chatId, timer);

  setTimeout(() => {
    clearInterval(timer);
    typingSessions.delete(chatId);
  }, 120000); // ⏱ stop auto après 2 min
}

// ================== 👰 HANDLER COMMANDES ==================
async function handleCommand(sock, mRaw) {
  try {
    if (!mRaw?.message) return;

    const m = smsg(sock, mRaw);
    const body = m.body?.trim();
    if (!body) return;

    const PREFIX = global.PREFIX || config.PREFIX;
    let isCommand = false;
    let commandName = '';
    let args = [];

    // ================== Parsing commandes ==================
    if (global.allPrefix) {
      const text = body.replace(/^[^a-zA-Z0-9]+/, '').trim();
      const parts = text.split(/\s+/);
      const potential = parts.shift()?.toLowerCase();

      if (commands[potential]) {
        isCommand = true;
        commandName = potential;
        args = parts;
      }
    } else if (body.startsWith(PREFIX)) {
      const parts = body.slice(PREFIX.length).trim().split(/\s+/);
      const potential = parts.shift()?.toLowerCase();

      if (commands[potential]) {
        isCommand = true;
        commandName = potential;
        args = parts;
      }
    }

    // ================== Admin / Owner ==================
    if (m.isGroup && isCommand) {
      const check = await checkAdminOrOwner(sock, m.chat, m.sender);
      m.isAdmin = check.isAdmin;
      m.isOwner = check.isOwner;
    } else {
      m.isAdmin = false;
      m.isOwner = false;
    }

    const ownerCheck = m.isOwner || m.fromMe;

    // ================== Modes ==================
    await handleBotModes(sock, m);
    if (global.botModes?.autoread?.enabled)
      await handleAutoread(sock, m);

    // ================== Mode privé ==================
    if (global.privateMode && !ownerCheck) {
      if (isCommand)
        return sock.sendMessage(
          m.chat,
          { text: WARN_MESSAGES.PRIVATE_MODE },
          { quoted: mRaw }
        );
      return;
    }

    // ================== User banni ==================
    if (global.bannedUsers?.has(m.sender?.toLowerCase())) {
      if (isCommand)
        return sock.sendMessage(
          m.chat,
          { text: WARN_MESSAGES.BANNED_USER },
          { quoted: mRaw }
        );
      return;
    }
    // ================== 📥 Inbox bloqué ==================
    if (global.blockInbox && !m.isGroup && !ownerCheck && isCommand) {
      if (!commands[commandName]) return;
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BLOCK_INBOX }, { quoted: mRaw });
    }
    // ================== Messages non-commandes ==================
    if (!isCommand && m.isGroup) {
      try {
        if (global.antiLinkGroups?.[m.chat]?.enabled && commands.antilink?.detect)
          await commands.antilink.detect(sock, m);

        if (global.antiSpamGroups?.[m.chat]?.enabled && commands.antispam?.detect)
          await commands.antispam.detect(sock, m);

        if (global.antiTagGroups?.[m.chat]?.enabled && commands.antitag?.detect)
          await commands.antitag.detect(sock, m);

        if (global.botModes.typing || global.botModes.recording)
          simulateTypingRecording(sock, m.chat);

        const mentionPath = path.join(process.cwd(), 'data', 'mention.json');
        let state = { enabled: false };
        try {
          state = JSON.parse(fs.readFileSync(mentionPath));
        } catch {}

        if (state.enabled && m.mentionedJid.includes(sock.user.id))
          await handleMention(sock, m);

      } catch (err) {
        console.error('❌ NE COMMANDES error:', err);
      }
      return;
    }

    // ================== Antidelete ==================
    if (commands.antidelete?.storeMessage) {
      const cfg = commands.antidelete.loadConfig?.() || { enabled: false };
      if (cfg.enabled)
        await commands.antidelete.storeMessage(sock, mRaw).catch(() => {});
    }

    // ================== Groupe désactivé ==================
    if (m.isGroup && global.disabledGroups.has(m.chat) && !ownerCheck)
      return sock.sendMessage(
        m.chat,
        { text: WARN_MESSAGES.BOT_OFF },
        { quoted: mRaw }
      );

    // ================== Throttle groupe ==================
    if (m.isGroup) {
      const now = Date.now();
      if (global.groupThrottle[m.chat] && now - global.groupThrottle[m.chat] < 1000)
        return;
      global.groupThrottle[m.chat] = now;
    }

    // ================== Exécution ==================
    const cmd = commands[commandName];
    if (!cmd) return;

    if (cmd.group && !m.isGroup)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.GROUP_ONLY }, { quoted: mRaw });

    if (cmd.admin && !m.isAdmin && !m.isOwner)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.ADMIN_ONLY(commandName) }, { quoted: mRaw });

    if (cmd.ownerOnly && !ownerCheck)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.OWNER_ONLY(commandName) }, { quoted: mRaw });

    if (cmd.execute) await cmd.execute(sock, m, args, storeMessage);
    else if (cmd.run) await cmd.run(sock, m, args, storeMessage);

    saveSettings();

  } catch (err) {
    console.error('❌ Handler error:', err);
  }
}

// ================== 👥 Participant update ==================
async function handleParticipantUpdate(sock, update) {
  try {
    for (const cmd of Object.values(commands)) {
      if (typeof cmd.participantUpdate === 'function') {
        await cmd.participantUpdate(sock, update).catch(() => {});
      }
    }
  } catch (err) {
    console.error('❌ handleParticipantUpdate error:', err);
  }
}

// ================== EXPORT ==================
export { loadCommands, commands, smsg, handleParticipantUpdate, saveSettings };
export default handleCommand;