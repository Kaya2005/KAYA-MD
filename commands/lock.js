const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363402565816662@newsletter',
    newsletterName: 'KAYA MD',
    serverMessageId: 143
  }
};
const checkAdminOrOwner = require('../utils/checkAdmin');

module.exports = {
  name: 'lock',
  description: '🔒 Ferme le groupe (seuls les admins peuvent écrire).',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    // Vérifie si l'utilisateur est admin ou owner
    const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
    permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

    if (!permissions.isAdminOrOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Accès refusé : Seuls les admins ou owners peuvent fermer le groupe.', contextInfo },
        { quoted: m }
      );
    }

    try {
      // Ferme le groupe pour tous
      await kaya.groupSettingUpdate(m.chat, 'announcement');

      const text = `
╭━━〔🔒 GROUPE FERMÉ〕━━⬣
┃ 📛 Les membres ne peuvent plus envoyer de messages.
┃ ✅ Utilise *.unlock* pour rouvrir le groupe.
╰━━━━━━━━━━━━━━━━━━━━⬣
      `.trim();

      await kaya.sendMessage(
        m.chat,
        { text, mentions: [m.sender], contextInfo },
        { quoted: m }
      );
    } catch (err) {
      console.error('Erreur lock.js :', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ Impossible de fermer le groupe. Vérifie que je suis admin.', contextInfo },
        { quoted: m }
      );
    }
  }
};