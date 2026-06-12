import chalk from 'chalk';

export default {
  name: "staff",
  description: "Affiche la liste des admins et du propriétaire du groupe",
  category: "Groupe",
  group: true,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;

      // Récupérer les infos du groupe
      const groupMetadata = await kaya.groupMetadata(chatId);

      // Récupérer l'image du groupe
      let pp;
      try {
        pp = await kaya.profilePictureUrl(chatId, 'image');
      } catch {
        pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // image par défaut
      }

      // Filtrer les admins
      const participants = groupMetadata.participants || [];
      const groupAdmins = participants.filter(p => p.admin || p.admin === 'superadmin');

      // Créer la liste à afficher
      const listAdmin = groupAdmins
        .map((v, i) => `▢ ${i + 1}. @${v.id.split('@')[0]}`)
        .join('\n');

      // Déterminer le propriétaire
      const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

      // Créer le texte du message
      const text = `
🌟 *GROUP ADMINS* - ${groupMetadata.subject}

👑 *Owner:*
▢ @${owner.split('@')[0]}

🛡️ *Admins (${groupAdmins.length}):*
${listAdmin}
`.trim();

      // Envoyer le message avec image et mentions
      await kaya.sendMessage(chatId, {
        image: { url: pp },
        caption: text,
        mentions: [...groupAdmins.map(v => v.id), owner]
      }, { quoted: m });

    } catch (error) {
      console.error(chalk.red('❌ Error in staff command:'), error);
      await kaya.sendMessage(m.chat, { text: '❌ Failed to fetch admin list!' }, { quoted: m });
    }
  }
};