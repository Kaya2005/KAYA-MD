import fetch from 'node-fetch';

export default {
  name: "stupid",
  description: "Génère une carte 'it's so stupid' pour un utilisateur",
  category: "Fun",
  group: false,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      const sender = m.sender;

      // Déterminer la cible
      const ctx = m.message?.extendedTextMessage?.contextInfo;
      const quotedMsg = ctx?.quotedMessage;
      const mentionedJid = ctx?.mentionedJid;
      const who = quotedMsg?.sender || (mentionedJid?.[0] ? mentionedJid[0] : sender);

      // Texte pour la carte (par défaut "im+stupid")
      const text = args?.length > 0 ? args.join(' ') : 'im+stupid';

      // Récupérer l'avatar
      let avatarUrl;
      try {
        avatarUrl = await kaya.profilePictureUrl(who, 'image');
      } catch {
        avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
      }

      // Appel API
      const apiUrl = `https://some-random-api.com/canvas/misc/its-so-stupid?avatar=${encodeURIComponent(avatarUrl)}&dog=${encodeURIComponent(text)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);

      const imageBuffer = await response.buffer();

      // Envoyer l'image avec mention
      await kaya.sendMessage(chatId, {
        image: imageBuffer,
        caption: `*@${who.split('@')[0]}*`,
        mentions: [who]
      }, { quoted: m });

    } catch (error) {
      console.error('❌ Error in stupid command:', error);
      await kaya.sendMessage(m.chat, { 
        text: '❌ Sorry, I couldn\'t generate the stupid card. Please try again later!' 
      }, { quoted: m });
    }
  }
};