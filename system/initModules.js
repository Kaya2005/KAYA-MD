// ==================== system/initModules.js ====================
import { downloadContentFromMessage as baileysDownload } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { uploadImage } from '../lib/uploadImage.js';
import { handleAutoread } from '../commands/autoread.js';
import { handleBotModes, loadBotModes } from './botStatus.js';

// ================== 🧠 LOAD BOT MODES ==================
if (!global.botModes) global.botModes = { autoreact: { enabled: false } };
loadBotModes();

// ================== 🧠 LOAD BANNED USERS ==================
if (!global.bannedUsers) global.bannedUsers = new Set();

// ================== STORE MESSAGES ==================
const messagesStore = {};
export function storeMessage(m) {
  if (!m?.chat || !m?.id) return;
  if (!messagesStore[m.chat]) messagesStore[m.chat] = {};
  messagesStore[m.chat][m.id] = m;
  return m;
}

// ================== DOWNLOAD CONTENT ==================
export async function downloadContentFromMessage(message, type) {
  try {
    const stream = await baileysDownload(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  } catch (err) {
    console.error('❌ downloadContentFromMessage error:', err);
    return null;
  }
}

// ================== EXPORTS ==================
export {
  uploadImage,
  handleAutoread,
  handleBotModes
};