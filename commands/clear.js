export default {
  name: 'clear',
  description: 'Supprime tout le contenu envoyé par le bot (comme WhatsApp)',
  category: 'Owner',

  async run(kaya, m, msg, store) {
    // 🔐 Owner uniquement (comme tu l’as demandé)
    if (!m.fromMe) return;

    const chatId = m.chat;
    const chatMessages = store?.messages?.get(chatId);

    if (!chatMessages) return;

    for (const data of chatMessages.values()) {
      if (data.key?.fromMe) {
        await kaya.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: true,
            id: data.key.id,
            participant: data.key.participant
          }
        });
      }
    }
  }
};