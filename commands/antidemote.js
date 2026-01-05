// ==================== commands/antidemote.js ====================
import fs from 'fs';
import path from 'path';
import checkAdminOrOwner from '../system/checkAdmin.js';
import { contextInfo } from '../system/contextInfo.js';

const antiDemoteFile = path.join(process.cwd(), 'system/antidemote.json');
let antiDemoteData = {};
if (fs.existsSync(antiDemoteFile)) {
  try { 
    antiDemoteData = JSON.parse(fs.readFileSync(antiDemoteFile, 'utf-8')); 
  } catch { 
    antiDemoteData = {}; 
  }
}

function saveAntiDemote() {
  fs.writeFileSync(antiDemoteFile, JSON.stringify(antiDemoteData, null, 2));
}

const processing = new Set();

export default {
  name: 'antidemote',
  description: '🛡️ Prevent automatic demotion of admins',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, args) => {
    if (!m.isGroup) 
      return kaya.sendMessage(m.chat, { text: '❌ This command only works in groups.', contextInfo }, { quoted: m });

    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    if (!permissions.isAdmin && !permissions.isOwner)
      return kaya.sendMessage(m.chat, { text: '🚫 Only group admins or the owner can toggle AntiDemote.', contextInfo }, { quoted: m });

    const chatId = m.chat;
    const action = args[0]?.toLowerCase();

    // ℹ️ Invalid usage
    if (!['on', 'off', 'status'].includes(action)) {
      return kaya.sendMessage(chatId, { 
        text: `*ANTIDEMOTE COMMAND*\n\n` +
              `.antidemote on     → Enable AntiDemote\n` +
              `.antidemote off    → Disable AntiDemote\n` +
              `.antidemote status → Check current status`,
        contextInfo
      }, { quoted: m });
    }

    if (action === 'on') {
      const metadata = await kaya.groupMetadata(chatId);
      antiDemoteData[chatId] = { 
        enabled: true, 
        protectedAdmins: metadata.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id)
      };
      saveAntiDemote();
      return kaya.sendMessage(m.chat, { text: '✅ *AntiDemote ENABLED*', contextInfo }, { quoted: m });
    }

    if (action === 'off') {
      delete antiDemoteData[chatId];
      saveAntiDemote();
      return kaya.sendMessage(m.chat, { text: '❌ *AntiDemote DISABLED*', contextInfo }, { quoted: m });
    }

    if (action === 'status') {
      const isActive = antiDemoteData[chatId]?.enabled || false;
      const count = antiDemoteData[chatId]?.protectedAdmins?.length || 0;
      return kaya.sendMessage(chatId, { 
        text: isActive ? `✅ *AntiDemote ENABLED*\nProtected admins: ${count}` : '❌ *AntiDemote DISABLED*',
        contextInfo
      }, { quoted: m });
    }
  },

  participantUpdate: async (kaya, update) => {
    const chatId = update.id;
    const participants = update.participants;
    const action = update.action;
    if (!antiDemoteData[chatId]?.enabled) return;
    if (action !== 'demote') return;

    const metadata = await kaya.groupMetadata(chatId).catch(() => null);
    if (!metadata) return;

    const botId = kaya.user.id;
    antiDemoteData[chatId].protectedAdmins = [
      ...new Set([
        ...(antiDemoteData[chatId].protectedAdmins || []),
        ...metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)
      ])
    ];
    saveAntiDemote();

    for (const user of participants) {
      if (user === botId) continue;
      const key = `${chatId}-${user}-demote`;
      if (processing.has(key)) continue;
      processing.add(key);

      setTimeout(async () => {
        try {
          if (antiDemoteData[chatId].protectedAdmins.includes(user)) {
            await kaya.groupParticipantsUpdate(chatId, [user], 'promote');
            await kaya.sendMessage(chatId, {
              text: `🛡️ *AntiDemote Active*\n@${user.split('@')[0]} has been automatically re-promoted.`,
              mentions: [user],
              contextInfo
            });
          }
        } finally {
          processing.delete(key);
        }
      }, 1500);
    }
  }
};