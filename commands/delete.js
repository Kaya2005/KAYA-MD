import checkAdminOrOwner from '../system/checkAdmin.js';

export default {
  name: 'del',
  alias: ['delete', 'rm'],
  description: 'Delete messages',
  category: 'Groupe',
  group: true,
  admin: true,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;

      if (!m.isGroup)
        return kaya.sendMessage(chatId, { text: '❌ Groupe uniquement.' }, { quoted: m });

      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdmin && !check.isOwner)
        return kaya.sendMessage(chatId, { text: '🚫 Admin seulement.' }, { quoted: m });

      // ===== CAS REPLY =====
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      if (ctx?.stanzaId) {
        await kaya.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: false,
            id: ctx.stanzaId,
            participant: ctx.participant
          }
        }).catch(console.error);
        return;
      }

      // ===== CAS SIMPLE =====
      await kaya.sendMessage(chatId, { delete: m.key }).catch(() => {});

    } catch (err) {
      console.error('[DEL ERROR]', err);
    }
  }
};