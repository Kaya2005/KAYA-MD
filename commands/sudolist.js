// ==================== commands/sudolist.js ====================
import config from '../config.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'sudolist',
  description: '📋 Affiche la liste des owners actuels',
  category: 'Owner',
  ownerOnly: true, 

  run: async (kaya, m, msg, store, args, context) => {
    try {
      
      if (!context.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: '🚫 *Commande réservée aux owners.*', contextInfo },
          { quoted: m }
        );
      }

      
      const owners = config.OWNER_NUMBER.split(',').map(o => o.trim());
      const ownerList = owners.map((id, i) => `*${i + 1}. wa.me/${id}*`).join('\n');

      
      return kaya.sendMessage(
        m.chat,
        { text: `╭━━〔 👑 LISTE DES OWNERS 〕━━⬣\n${ownerList}\n╰────────────────────⬣`, contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Erreur sudolist.js :', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Une erreur est survenue lors de l’affichage de la liste des owners.', contextInfo },
        { quoted: m }
      );
    }
  }
};