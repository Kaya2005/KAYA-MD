// ==================== commands/welcome.js ====================
import fs from 'fs';
import path from 'path';
import decodeJid from '../utils/decodeJid.js';
import { contextInfo } from '../utils/contextInfo.js';
import checkAdminOrOwner from '../utils/checkAdmin.js';

const welcomeFile = path.join(process.cwd(), 'data', 'welcome.json');
let welcomeData = {};

// Charger ou créer le fichier welcome.json
try {
  welcomeData = JSON.parse(fs.readFileSync(welcomeFile, 'utf-8'));
} catch {
  welcomeData = {};
  fs.writeFileSync(welcomeFile, JSON.stringify({}, null, 2));
}

function saveWelcomeData() {
  fs.writeFileSync(welcomeFile, JSON.stringify(welcomeData, null, 2));
}

export default {
  name: 'welcome',
  description: 'Active ou désactive le message de bienvenue dans les groupes',
  category: 'Bot',

  run: async (kaya, m, msg, store, args, context) => {
    try {
      if (!context.isGroup) return kaya.sendMessage(
        m.chat, 
        { text: '❌ Cette commande fonctionne uniquement dans un groupe.', contextInfo },
        { quoted: msg }
      );

      const chatId = decodeJid(m.chat);
      const sender = decodeJid(m.sender);

      const permissions = await checkAdminOrOwner(kaya, chatId, sender);
      const isAdminOrOwner = permissions.isAdmin || permissions.isOwner;

      if (!isAdminOrOwner) return kaya.sendMessage(
        chatId, 
        { text: '🚫 Accès refusé : Seuls les admins ou owners peuvent utiliser cette commande.', contextInfo },
        { quoted: msg }
      );

      const groupPP = await kaya.profilePictureUrl(chatId, 'image').catch(() => 'https://i.imgur.com/3XjWdoI.png');

      let subCmd = args[0]?.toLowerCase() || '';
      if (!subCmd && m.body.toLowerCase().startsWith('.welcome')) {
        subCmd = m.body.toLowerCase().replace('.welcome', '').trim();
      }

      if (subCmd === 'on' || subCmd === '1') {
        welcomeData[chatId] = true;
        saveWelcomeData();
        return kaya.sendMessage(chatId, { 
          image: { url: groupPP },
          caption: '✅ *WELCOME ACTIVÉ* pour ce groupe !',
          contextInfo
        }, { quoted: msg });
      }

      if (subCmd === 'off') {
        delete welcomeData[chatId];
        saveWelcomeData();
        return kaya.sendMessage(chatId, { 
          image: { url: groupPP },
          caption: '❌ *WELCOME DÉSACTIVÉ* pour ce groupe.',
          contextInfo
        }, { quoted: msg });
      }

      if (subCmd === 'all') {
        if (!permissions.isOwner) return kaya.sendMessage(
          chatId, 
          { text: '❌ Seul le propriétaire peut activer/désactiver pour tous les groupes.', contextInfo },
          { quoted: msg }
        );

        if (args[1]?.toLowerCase() === 'off') {
          delete welcomeData.global;
          saveWelcomeData();
          return kaya.sendMessage(chatId, { 
            image: { url: groupPP },
            caption: '❌ *WELCOME DÉSACTIVÉ* pour tous les groupes 🌍',
            contextInfo
          }, { quoted: msg });
        } else {
          welcomeData.global = true;
          saveWelcomeData();
          return kaya.sendMessage(chatId, { 
            image: { url: groupPP },
            caption: '✅ *WELCOME ACTIVÉ* pour tous les groupes 🌍',
            contextInfo
          }, { quoted: msg });
        }
      }

      return kaya.sendMessage(chatId, {
        text: '❓ Utilise `.welcome on`, `.welcome off`, `.welcome all` ou `.welcome all off`.',
        contextInfo
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ Erreur welcome run :', err);
      return kaya.sendMessage(m.chat, { text: `❌ Erreur welcome : ${err.message}`, contextInfo }, { quoted: msg });
    }
  },

  participantUpdate: async (kaya, update) => {
    const chatId = decodeJid(update.id);
    const { participants, action } = update;

    if (action !== 'add' || (!welcomeData.global && !welcomeData[chatId])) return;

    const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    for (const user of participants) {
      try {
        const metadata = await kaya.groupMetadata(chatId).catch(() => null);
        if (!metadata) return;

        const userPP = await kaya.profilePictureUrl(user, 'image').catch(() => null);
        const imageUrl = userPP || await kaya.profilePictureUrl(chatId, 'image').catch(() => 'https://i.imgur.com/3XjWdoI.png');

        const username = '@' + user.split('@')[0];
        const groupName = metadata.subject || 'Nom inconnu';
        const groupSize = metadata.participants.length;
        const creationDate = new Date(metadata.creation * 1000).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

        const welcomeText = `╭━━〔 WELCOME  〕━━⬣
├ 👤 Bienvenue ${username}
├ 🎓 Groupe: *${groupName}*
├ 👥 Membres : ${groupSize}
├ 🏗️ Créé le : ${creationDate}
├ 📆 Date: ${now}
├ 📜 \`Règles\` :
│  ┗ Pas de liens interdits ❌
│  ┗ Pas de contenu xxx 🔞
│  ┗ Pas de spam 🚫
╰─────────────────────⬣`;

        await kaya.sendMessage(chatId, {
          image: { url: imageUrl },
          caption: welcomeText,
          mentions: [user],
          contextInfo: { ...contextInfo, mentionedJid: [user] }
        });

      } catch (err) {
        console.error('❌ Erreur welcome participantUpdate :', err);
      }
    }
  }
};