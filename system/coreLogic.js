import fs from 'fs';
import path from 'path';
import config from '../config.js';
import checkAdminOrOwner from './checkAdmin.js';
import { WARN_MESSAGES } from './warnMessages.js';
import { handleMention } from './mentionHandler.js';
import { handleAutoread, handleBotModes } from './initModules.js';

const typingSessions = new Map();

async function simulateTypingRecording(sock, chatId) {
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

export async function coreLogic(context) {
  const { sock, m, mRaw, body, commands, storeMessage, saveSettings } = context;

  try {
    // Typing/recording automatique
    if (global.botModes?.typing || global.botModes?.recording)
      simulateTypingRecording(sock, m.chat);

    // ===== Parse commande =====
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

    // Admin / Owner check
    if (m.isGroup && isCommand) {
      const check = await checkAdminOrOwner(sock, m.chat, m.sender);
      m.isAdmin = check.isAdmin;
      m.isOwner = check.isOwner;
    } else { m.isAdmin = false; m.isOwner = false; }
    const ownerCheck = m.isOwner || m.fromMe;

    // Bot modes / autoread
    await handleBotModes(sock, m);
    if (global.botModes?.autoread?.enabled) await handleAutoread(sock, m);

    // Sécurité
    if (global.privateMode && !ownerCheck && isCommand)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.PRIVATE_MODE }, { quoted: mRaw });
    if (global.bannedUsers?.has(m.sender?.toLowerCase()) && isCommand)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BANNED_USER }, { quoted: mRaw });
    if (global.blockInbox && !m.isGroup && !ownerCheck && isCommand)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BLOCK_INBOX }, { quoted: mRaw });

    // Messages non-commandes (AntiBot/AntiLink/AntiSpam/AntiTag + Mentions)
    if (!isCommand && m.isGroup) {
      if (global.startupGrace.enabled) return;

      try {
        const checks = [];
        const g = m.chat;
        if (global.antiLinkGroups?.[g]?.enabled && commands.antilink?.detect) checks.push(commands.antilink.detect(sock, m));
        if (global.antiBotGroups?.[g]?.enabled && commands.antibot?.detect) checks.push(commands.antibot.detect(sock, m));
        if (global.antiSpamGroups?.[g]?.enabled && commands.antispam?.detect) checks.push(commands.antispam.detect(sock, m));
        if (global.antiTagGroups?.[g]?.enabled && commands.antitag?.detect) checks.push(commands.antitag.detect(sock, m));
        if (global.antiActuGroups?.[g]?.enabled && commands.antiActu?.detect)
    checks.push(commands.antiActu.detect(sock, m));
        if (global.antiChannelGroups?.[g]?.enabled && commands.antichannel?.detect) checks.push(commands.antichannel.detect(sock, m));
        if (global.antiStatusGroups?.[g]?.enabled && commands.antistatus?.detect) checks.push(commands.antistatus.detect(sock, m));
        void Promise.allSettled(checks);

        // Mentions automatiques
        if (!global._mentionState) {
          try { global._mentionState = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'mention.json'))); } 
          catch { global._mentionState = { enabled: false }; }
        }
        if (global._mentionState.enabled && m.mentionedJid.includes(sock.user.id))
          await handleMention(sock, m);

      } catch (err) { console.error('❌ Non-command checks error:', err); }
      return;
    }

    // Antidelete
    if (commands.antidelete?.storeMessage && commands.antidelete.loadConfig?.().enabled)
      await commands.antidelete.storeMessage(sock, mRaw).catch(() => {});

    // Groupe désactivé
    if (m.isGroup && global.disabledGroups.has(m.chat) && !ownerCheck)
      return sock.sendMessage(m.chat, { text: WARN_MESSAGES.BOT_OFF }, { quoted: mRaw });

    // Throttle par groupe
    if (m.isGroup) {
      const now = Date.now();
      const delay = isCommand ? 300 : 1000;
      if (!global.startupGrace.enabled && global.groupThrottle[m.chat] && now - global.groupThrottle[m.chat] < delay) return;
      global.groupThrottle[m.chat] = now;
    }

    // Exécution de la commande
    const cmd = commands[commandName];
    if (!cmd) return;
    if (cmd.group && !m.isGroup) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.GROUP_ONLY }, { quoted: mRaw });
    if (cmd.admin && !m.isAdmin && !ownerCheck) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.ADMIN_ONLY(commandName) }, { quoted: mRaw });
    if (cmd.ownerOnly && !ownerCheck) return sock.sendMessage(m.chat, { text: WARN_MESSAGES.OWNER_ONLY(commandName) }, { quoted: mRaw });

    if (cmd.execute) await cmd.execute(sock, m, args, storeMessage).catch(() => {});
    else if (cmd.run) await cmd.run(sock, m, args, storeMessage).catch(() => {});

    saveSettings();

  } catch (err) {
    console.error('❌ CORE LOGIC error:', err);
  }
}