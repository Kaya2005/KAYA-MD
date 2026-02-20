import fs from 'fs';
import path from 'path';
import checkAdminOrOwner from './checkAdmin.js'; // pour vérification en direct si besoin

// ================== Typing / Recording ==================
const typingSessions = new Map();

export async function typing(sock, chatId) {
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

// ================== AutoRead ==================
export async function autoread(sock, m) {
  if (global.botModes?.autoread?.enabled) {
    await sock.sendReadReceipt(m.chat, m.sender, [m.id]);
  }
}

// ================== AntiTag ==================
export async function antiTag(sock, m) {
  if (!m.mentionedJid?.length) return false;

  if (m.isAdmin || m.isOwner) return false;

  await sock.sendMessage(m.chat, { text: '⚠️ Pas de mention abusive !' }, { quoted: m });
  return true;
}

// ================== AntiBot ==================
export async function antiBot(sock, m) {
  if (m.isAdmin || m.isOwner) return false;

  if (m.sender.endsWith('bot')) {
    await sock.sendMessage(m.chat, { text: '🤖 Bot détecté !' }, { quoted: m });
    return true;
  }
  return false;
}

// ================== AntiSpam ==================
global.messageRate ??= {};
export async function antiSpam(sock, m) {
  if (m.isAdmin || m.isOwner) return false;

  const now = Date.now();
  const sender = m.sender;

  if (!global.messageRate[sender]) global.messageRate[sender] = [];
  global.messageRate[sender] = global.messageRate[sender].filter(t => now - t < 5000);
  global.messageRate[sender].push(now);

  if (global.messageRate[sender].length > 5) {
    await sock.sendMessage(m.chat, { text: '⚠️ Stop spam !' }, { quoted: m });
    return true;
  }

  return false;
}

// ================== AntiStatus ==================
export async function antiStatus(sock, m) {
  if (m.isAdmin || m.isOwner) return false;

  // Ici tu peux ajouter ta logique anti-modif statut / description
  return false;
}