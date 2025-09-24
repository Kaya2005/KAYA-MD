// ==================== commands/unban.js ====================
import fs from 'fs';
import path from 'path';
import { contextInfo } from '../utils/contextInfo.js'; // centralisé

const banFile = path.join(process.cwd(), 'data/ban.json');

// Charger la liste des bannis
let bannedUsers = [];
if (fs.existsSync(banFile)) {
  bannedUsers = JSON.parse(fs.readFileSync(banFile, 'utf-8'));
} else {
  fs.writeFileSync(banFile, JSON.stringify(bannedUsers, null, 2));
}

// Fonction pour sauvegarder
function saveBanned() {
  fs.writeFileSync(banFile, JSON.stringify(bannedUsers, null, 2));
}

export default {
  name: 'unban',
  description: 'Débannir un utilisateur du bot (owner uniquement)',
  category: 'Owner',
  ownerOnly: true, // ✅ le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    try {
      // ✅ Vérifie si le sender est owner
      if (!context.isOwner) {
        return kaya.sendMessage(
          m.chat,
          { text: '🚫 Cette commande est réservée au propriétaire du bot.', contextInfo },
          { quoted: m }
        );
      }

      // Récupération du numéro cible (reply / mention / argument)
      let target = m.quoted?.sender?.split('@')[0];

      if (!target) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (mentioned?.length) target = mentioned[0].split('@')[0];
        else if (args[0]) target = args[0].replace(/\D/g, '');
      }

      if (!target) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Indique le numéro à débannir (ou reply au message).', contextInfo },
          { quoted: m }
        );
      }

      // Vérifie si l'utilisateur est dans la liste des bannis
      if (!bannedUsers.includes(target)) {
        return kaya.sendMessage(
          m.chat,
          { 
            text: `❌ L'utilisateur *@${target}* n'est pas banni.`, 
            mentions: [target + '@s.whatsapp.net'], 
            contextInfo 
          },
          { quoted: m }
        );
      }

      // Retirer l'utilisateur de la liste
      bannedUsers = bannedUsers.filter(u => u !== target);
      saveBanned();

      return kaya.sendMessage(
        m.chat,
        { 
          text: `✅ Utilisateur *@${target}* débanni avec succès !`, 
          mentions: [target + '@s.whatsapp.net'], 
          contextInfo 
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Erreur unban.js :', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Impossible de débannir l\'utilisateur.', contextInfo },
        { quoted: m }
      );
    }
  }
};