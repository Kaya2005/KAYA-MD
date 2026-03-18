// ====================== coreLogic.js ======================
import config from '../config.js';
import checkAdminOrOwner from './checkAdmin.js';
import { WARN_MESSAGES } from './warnMessages.js';
import { handleMention } from './mentionHandler.js';
import { handleAutoread, handleBotModes } from './initModules.js';
import antibadword from '../commands/antibadword.js';

const typingSessions = new Map();
global.groupCooldown ??= {};
global._adminCache ??= new Map();

export async function simulateTypingRecording(sock, chatId) {
  if (!chatId || typingSessions.has(chatId)) return;
  const timer = setInterval(async () => {
    try {
      if (global.botModes?.typing) await sock.sendPresenceUpdate('composing', chatId);
      if (global.botModes?.recording) await sock.sendPresenceUpdate('recording', chatId);
    } catch {}
  }, 30000);
  typingSessions.set(chatId, timer);
  setTimeout(() => {
    clearInterval(timer);
    typingSessions.delete(chatId);
  }, 120000);
}

export async function coreLogic({ sock, m, mRaw, body, commands, storeMessage, saveSettings }) {
  if (!m?.chat || !sock) return;

  const now = Date.now();

  // 🔥 Cooldown groupe
  if (m.isGroup) {
    if (global.groupCooldown[m.chat] && now - global.groupCooldown[m.chat] < 1500) return;
    global.groupCooldown[m.chat] = now;
  }

  // 🔥 Typing seulement privé
  if ((global.botModes?.typing || global.botModes?.recording) && !m.isGroup) simulateTypingRecording(sock, m.chat);

  // ===== Parse command =====
  const PREFIX = global.PREFIX ?? config.PREFIX;
  let isCommand = false, commandName = '', args = [];
  const text = global.allPrefix
    ? body?.replace(/^[^a-zA-Z0-9]+/, '').trim()
    : body?.startsWith(PREFIX)
      ? body.slice(PREFIX.length).trim()
      : '';
  if (text) {
    const parts = text.split(/\s+/);
    const potential = parts.shift()?.toLowerCase();
    if (potential && commands[potential]) { isCommand = true; commandName = potential; args = parts; }
  }

  // ===== Admin/Owner check (cache 60s) =====
  if (m.isGroup && isCommand) {
    const cacheKey = `${m.chat}-${m.sender}`;
    const cached = global._adminCache.get(cacheKey);
    if (cached && Date.now() - cached.time < 60000) {
      m.isAdmin = cached.isAdmin;
      m.isOwner = cached.isOwner;
    } else {
      const check = await checkAdminOrOwner(sock, m.chat, m.sender);
      m.isAdmin = check?.isAdmin || false;
      m.isOwner = check?.isOwner || false;
      global._adminCache.set(cacheKey, { isAdmin: m.isAdmin, isOwner: m.isOwner, time: Date.now() });
    }
  } else { m.isAdmin = false; m.isOwner = false; }
  const ownerCheck = m.isOwner || m.fromMe;

  // ===== Bot modes & autoread =====
  handleBotModes(sock, m);
  if (global.botModes?.autoread?.enabled) handleAutoread(sock, m);

  // ===== Security =====
  if ((global.privateMode && !ownerCheck && isCommand) || (global.bannedUsers?.has(m.sender?.toLowerCase()) && isCommand)) {
    return sock.sendMessage(m.chat, { text: global.privateMode ? WARN_MESSAGES.PRIVATE_MODE : WARN_MESSAGES.BANNED_USER }, { quoted: mRaw });
  }
  if (global.blockInbox && !m.isGroup && !ownerCheck && isCommand) return;

  // ===== Non-command group checks (modules activés seulement) =====
  if (!isCommand && m.isGroup && !global.startupGrace?.enabled) {
    const g = m.chat;
    const checks = [];

    const modules = [
      { key: "antiLink", cmd: commands.antilink },
      { key: "antiBot", cmd: commands.antibot },
      { key: "antiSpam", cmd: commands.antispam },
      { key: "antiTag", cmd: commands.antitag },
      { key: "antiActu", cmd: commands.antiActu },
      { key: "antiChannel", cmd: commands.antichannel },
      { key: "antiStatus", cmd: commands.antistatus },
      { key: "antiBadword", cmd: antibadword }
    ];

    for (const mod of modules) {
      const groupData = global[`${mod.key}Groups`]?.[g];
      if (groupData?.enabled && mod.cmd?.detect) {
        checks.push(mod.cmd.detect(sock, m));
      }
    }

    if (checks.length > 0) Promise.allSettled(checks).catch(() => {});

    if (global._mentionState?.enabled && m.mentionedJid?.includes(sock.user?.id)) {
      handleMention(sock, m).catch(console.error);
    }

    return;
  }

  // ===== Command execution =====
  if (!isCommand) return;
  if (m.isGroup && global.disabledGroups?.has(m.chat) && !ownerCheck) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BOT_OFF }, { quoted: mRaw });

  const cmd = commands[commandName];
  if (!cmd) return;
  if (cmd.group && !m.isGroup) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.GROUP_ONLY }, { quoted: mRaw });
  if (cmd.admin && !m.isAdmin && !ownerCheck) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.ADMIN_ONLY(commandName) }, { quoted: mRaw });
  if (cmd.ownerOnly && !ownerCheck) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.OWNER_ONLY(commandName) }, { quoted: mRaw });

  Promise.resolve(cmd.execute ? cmd.execute(sock, m, args, storeMessage) : cmd.run?.(sock, m, args, storeMessage)).catch(console.error);
  saveSettings();
}