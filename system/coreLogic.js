// ====================== coreLogic.js ======================

import config from '../config.js';
import checkAdminOrOwner from './checkAdmin.js';
import { WARN_MESSAGES } from './warnMessages.js';
import { handleMention } from './mentionHandler.js';
import {
  handleAutoread,
  handleBotModes
} from './initModules.js';
import antibadword from '../commands/antibadword.js';

// ========================================
// GLOBALS
// ========================================

const typingSessions = new Map();

global.groupCooldown ??= new Map();
global._adminCache ??= new Map();

// ========================================
// AUTO CLEAN MEMORY
// ========================================

// Nettoyage cooldown groupes
setInterval(() => {
  const now = Date.now();

  for (const [group, time] of global.groupCooldown.entries()) {
    if (now - time > 10000) {
      global.groupCooldown.delete(group);
    }
  }
}, 30000);

// Nettoyage cache admin
setInterval(() => {
  const now = Date.now();

  for (const [key, value] of global._adminCache.entries()) {
    if (now - value.time > 60000) {
      global._adminCache.delete(key);
    }
  }
}, 60000);

// ========================================
// TYPING / RECORDING
// ========================================

export async function simulateTypingRecording(sock, chatId) {
  try {
    if (!chatId) return;

    if (typingSessions.has(chatId)) return;

    const interval = setInterval(async () => {
      try {
        if (global.botModes?.typing) {
          await sock.sendPresenceUpdate('composing', chatId);
        }

        if (global.botModes?.recording) {
          await sock.sendPresenceUpdate('recording', chatId);
        }
      } catch {}
    }, 45000);

    typingSessions.set(chatId, interval);

    setTimeout(() => {
      clearInterval(interval);
      typingSessions.delete(chatId);
    }, 90000);

  } catch {}
}

// ========================================
// CORE LOGIC
// ========================================

export async function coreLogic({
  sock,
  m,
  body,
  commands,
  storeMessage,
  saveSettings
}) {
  try {
    if (!m?.chat || !sock) return;

    const now = Date.now(); // ✅ UNIQUE now

    // ====================================
    // GROUP COOLDOWN
    // ====================================

    if (m.isGroup) {
      const last = global.groupCooldown.get(m.chat);

      if (last && now - last < 1500) return;

      global.groupCooldown.set(m.chat, now);
    }

    // ====================================
    // TYPING PRIVÉ
    // ====================================

    if (
      !m.isGroup &&
      (global.botModes?.typing || global.botModes?.recording)
    ) {
      simulateTypingRecording(sock, m.chat);
    }

    // ====================================
    // PARSE COMMAND
    // ====================================

    const PREFIX = global.PREFIX ?? config.PREFIX;

    let isCommand = false;
    let commandName = '';
    let args = [];

    const text = global.allPrefix
      ? body?.replace(/^[^a-zA-Z0-9]+/, '').trim()
      : body?.startsWith(PREFIX)
        ? body.slice(PREFIX.length).trim()
        : '';

    if (text) {
      const parts = text.split(/\s+/);
      const potential = parts.shift()?.toLowerCase();

      if (potential && commands[potential]) {
        isCommand = true;
        commandName = potential;
        args = parts;
      }
    }

    // ====================================
    // ADMIN / OWNER CACHE
    // ====================================

    if (m.isGroup && isCommand) {
      const cacheKey = `${m.chat}-${m.sender}`;
      const cached = global._adminCache.get(cacheKey);

      if (cached && now - cached.time < 60000) {
        m.isAdmin = cached.isAdmin;
        m.isOwner = cached.isOwner;
      } else {
        const check = await checkAdminOrOwner(sock, m.chat, m.sender);

        m.isAdmin = check?.isAdmin || false;
        m.isOwner = check?.isOwner || false;

        global._adminCache.set(cacheKey, {
          isAdmin: m.isAdmin,
          isOwner: m.isOwner,
          time: now
        });
      }
    } else {
      m.isAdmin = false;
      m.isOwner = false;
    }

    // ====================================
    // OWNER CHECK
    // ====================================

    const ownerCheck = Boolean(m.isOwner || m.fromMe === true);

    // ====================================
    // BOT MODES (ONE BLOCK ONLY)
    // ====================================

    try {
      handleBotModes(sock, m);

      if (global.botModes?.autoread?.enabled) {
        handleAutoread(sock, m);
      }
    } catch {}

    // ====================================
    // SECURITY
    // ====================================

    if (
      (global.privateMode && !ownerCheck && isCommand) ||
      (global.bannedUsers?.has(m.sender?.toLowerCase()) && isCommand)
    ) {
      return sock.sendMessage(
        m.chat,
        {
          text: global.privateMode
            ? WARN_MESSAGES.PRIVATE_MODE
            : WARN_MESSAGES.BANNED_USER
        },
        { quoted: m }
      );
    }

    if (global.blockInbox && !m.isGroup && !ownerCheck && isCommand) return;

    // ====================================
    // NON COMMAND MODULES
    // ====================================

    if (!isCommand && m.isGroup && !global.startupGrace?.enabled) {
      const modules = [
        { key: 'antiLink', cmd: commands.antilink },
        { key: 'antiBot', cmd: commands.antibot },
        { key: 'antiSpam', cmd: commands.antispam },
        { key: 'antiTag', cmd: commands.antitag },
        { key: 'antiActu', cmd: commands.antiActu },
        { key: 'antiChannel', cmd: commands.antichannel },
        { key: 'antiStatus', cmd: commands.antistatus },
        { key: 'antiBadword', cmd: antibadword }
      ];

      for (const mod of modules) {
        try {
          const groupData = global[`${mod.key}Groups`]?.[m.chat];

          if (groupData?.enabled && mod.cmd?.detect) {
            await mod.cmd.detect(sock, m);
          }
        } catch {}
      }

      if (
        global._mentionState?.enabled &&
        m.mentionedJid?.includes(sock.user?.id)
      ) {
        setImmediate(() => {
          handleMention(sock, m).catch(() => {});
        });
      }

      return;
    }

    if (!isCommand) return;

    // ====================================
    // GROUP DISABLED
    // ====================================

    if (
      m.isGroup &&
      global.disabledGroups?.has(m.chat) &&
      !ownerCheck
    ) {
      return sock.sendMessage(
        m.chat,
        { text: WARN_MESSAGES.BOT_OFF },
        { quoted: m }
      );
    }

    const cmd = commands[commandName];
    if (!cmd) return;

    if (cmd.group && !m.isGroup) {
      return sock.sendMessage(
        m.chat,
        { text: WARN_MESSAGES.GROUP_ONLY },
        { quoted: m }
      );
    }

    if (cmd.admin && !m.isAdmin && !ownerCheck) {
      return sock.sendMessage(
        m.chat,
        { text: WARN_MESSAGES.ADMIN_ONLY(commandName) },
        { quoted: m }
      );
    }

    if (cmd.ownerOnly && !ownerCheck) {
      return sock.sendMessage(
        m.chat,
        { text: WARN_MESSAGES.OWNER_ONLY(commandName) },
        { quoted: m }
      );
    }

    await Promise.resolve(
      cmd.execute
        ? cmd.execute(sock, m, args, storeMessage)
        : cmd.run?.(sock, m, args, storeMessage)
    ).catch(console.error);

    if (cmd.save !== false) saveSettings();

  } catch (e) {
    console.error('Erreur coreLogic :', e);
  }
}