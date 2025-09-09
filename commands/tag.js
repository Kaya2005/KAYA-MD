const checkAdminOrOwner = require('../utils/checkAdmin');
const { contextInfo } = require('../utils/contextInfo'); // import centralisé

module.exports = {
  name: 'tag',
  description: 'Mentionne tous les membres avec un message',
  category: 'Groupe',
  group: true,
  admin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(m.chat, {
          text: '❌ Cette commande fonctionne uniquement dans un groupe.',
          contextInfo
        }, { quoted: m });
      }

      const metadata = await kaya.groupMetadata(m.chat).catch(() => null);
      if (!metadata) {
        return kaya.sendMessage(m.chat, {
          text: '❌ Impossible de récupérer les informations du groupe.',
          contextInfo
        }, { quoted: m });
      }

      // Vérifie si l’utilisateur est admin ou owner
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (!permissions.isAdmin && !permissions.isOwner) {
        return kaya.sendMessage(m.chat, {
          text: '🚫 Accès refusé : Seuls les admins ou owners peuvent utiliser cette commande.',
          contextInfo
        }, { quoted: m });
      }

      const members = metadata.participants.map(p => p.id);
      const message = m.quoted?.text || args.join(' ') || '_Aucun message fourni._';

      // ✅ Message principal de tag envoyé AVEC contextInfo
      await kaya.sendMessage(m.chat, {
        text: message,
        mentions: members,
        contextInfo
      }, { quoted: m });

    } catch (err) {
      console.error('Erreur commande tag :', err);
      await kaya.sendMessage(m.chat, {
        text: '❌ Une erreur est survenue lors de l’envoi du tag.',
        contextInfo
      }, { quoted: m });
    }
  }
};