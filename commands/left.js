// ================= commands/left.js =================
import config from '../config.js';

export default {
  name: 'left',
  description: 'Le bot quitte le groupe (owner uniquement)',
  category: 'Owner',
  ownerOnly: true, // ✅ le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    // ✅ Vérifie que seul le propriétaire peut utiliser
    if (!context.isOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Cette commande est réservée au propriétaire du bot.' },
        { quoted: m }
      );
    }

    // ✅ Vérifie que c'est un groupe
    if (!m.isGroup) {
      return kaya.sendMessage(
        m.chat,
        { text: '❗ Cette commande doit être utilisée dans un groupe.' },
        { quoted: m }
      );
    }

    try {
      // Le bot quitte silencieusement le groupe
      await kaya.groupLeave(m.chat);
    } catch (e) {
      console.error('❌ Erreur leave:', e);
      return kaya.sendMessage(
        m.chat,
        { text: '⚠️ Impossible de quitter le groupe.' },
        { quoted: m }
      );
    }
  }
};