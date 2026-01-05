// ==================== commands/antipromote.js ====================
import fs from 'fs';
import path from 'path';
import checkAdminOrOwner from '../system/checkAdmin.js';
import { contextInfo } from '../system/contextInfo.js';

const antiPromoteFile = path.join(process.cwd(), 'system/antipromote.json');
let antiPromoteData = {};
if (fs.existsSync(antiPromoteFile)) {
  try { 
    antiPromoteData = JSON.parse(fs.readFileSync(antiPromoteFile, 'utf-8')); 
  } catch { 
    antiPromoteData = {}; 
  }
}

function saveAntiPromote() {
  fs.writeFileSync(antiPromoteFile, JSON.stringify(antiPromoteData, null, 2));
}

const processing = new Set();

export default {
  name: 'antipromote',
  description: '🚫 Prevent automatic promotion of members',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, args) => {
    if (!m.isGroup) 
      return kaya.sendMessage(m.chat, { text: '❌ This command only works in groups.', contextInfo }, { quoted: m });

    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    if (!permissions.isAdminOrOwner) 
      return kaya.sendMessage(m.chat, { text: '🚫 Only group admins or the owner can toggle AntiPromote.', contextInfo }, { quoted: m });

    const chatId = m.chat;
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
      antiPromoteData[chatId] = { enabled: true };
      saveAntiPromote();
      return kaya.sendMessage(m.chat, { text: '✅ *AntiPromote ENABLED*', contextInfo }, { quoted: m });
    }

    if (action === 'off') {
      delete antiPromoteData[chatId];
      saveAntiPromote();
      return kaya.sendMessage(m.chat, { text: '❌ *AntiPromote DISABLED*', contextInfo }, { quoted: m });
    }

    if (action === 'status') {
      const isActive = antiPromoteData[chatId]?.enabled || false;
      return kaya.sendMessage(m.chat, { text: isActive ? '✅ *AntiPromote ENABLED*' : '❌ *AntiPromote DISABLED*', contextInfo }, { quoted: m });
    }

    return kaya.sendMessage(m.chat, { text: 'ℹ️ Usage: .antipromote on/off/status', contextInfo }, { quoted: m });
  },

  participantUpdate: async (kaya, update) => {
    const chatId = update.id;
    const participants = update.participants;
    const action = update.action;
    if (!antiPromoteData[chatId]?.enabled) return;
    if (action !== 'promote') return;

    const botId = kaya.user.id;
    for (const user of participants) {
      if (user === botId) continue;
      const key = `${chatId}-${user}-promote`;
      if (processing.has(key)) continue;
      processing.add(key);

      setTimeout(async () => {
        try {
          await kaya.groupParticipantsUpdate(chatId, [user], 'demote');
          await kaya.sendMessage(chatId, {
            text: `🚫 *AntiPromote Active*\n@${user.split('@')[0]} has been automatically demoted.`,
            mentions: [user],
            contextInfo
          });
        } finally {
          processing.delete(key);
        }
      }, 1000);
    }
  }
};