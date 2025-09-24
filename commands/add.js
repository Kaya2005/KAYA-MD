// commands/add.js
import checkAdminOrOwner from '../utils/checkAdmin.js';
import decodeJid from '../utils/decodeJid.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'add',
  description: '➕ Ajouter un membre au groupe (Admins/Owner uniquement, silencieux)',
  category: 'Groupe',
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Cette commande fonctionne uniquement dans un groupe.', contextInfo },
          { quoted: m }
        );
      }

      
      const permissions = await checkAdminOrOwner(kaya, m.chat, m.sender);
      permissions.isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

      if (!permissions.isAdminOrOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: '🚫 Seuls les *Admins* ou le *Propriétaire* peuvent ajouter un membre.', contextInfo },
          { quoted: m }
        );
      }

      
      if (!args[0]) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Utilisation : *.add 225070000000*', contextInfo },
          { quoted: m }
        );
      }

      const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

      
      const metadata = await kaya.groupMetadata(m.chat);
      const targetExists = metadata.participants.find(p => decodeJid(p.id) === decodeJid(target));
      if (targetExists) {
        return kaya.sendMessage(
          m.chat,
          { text: `ℹ️ @${target.split('@')[0]} est déjà dans le groupe.`, mentions: [target], contextInfo },
          { quoted: m }
        );
      }

      
      await kaya.groupParticipantsUpdate(m.chat, [target], 'add');

      return kaya.sendMessage(
        m.chat,
        { text: `✅ @${target.split('@')[0]} a été ajouté au groupe.`, mentions: [target], contextInfo },
        { quoted: m }
      );

    } catch (err) {
      console.error('Erreur commande add:', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Impossible d’ajouter ce membre. Vérifie le numéro.', contextInfo },
        { quoted: m }
      );
    }
  }
};