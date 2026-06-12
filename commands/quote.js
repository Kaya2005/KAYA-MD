import fetch from 'node-fetch';

export default {
  name: "quote",
  description: "Get a random inspirational quote",
  category: "Fun",
  group: false,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    const chatId = m.chat;

    try {
      const shizoApiKey = 'shizo';
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${shizoApiKey}`);

      if (!res.ok) throw new Error(`API responded with status ${res.status}`);

      const json = await res.json();
      const quoteMessage = json.result || "No quote available right now.";

      await kaya.sendMessage(chatId, { text: quoteMessage, mentions: [m.sender] }, { quoted: m });

    } catch (error) {
      console.error('❌ Error in quoteCommand:', error);
      await kaya.sendMessage(chatId, { text: '❌ Failed to get quote. Please try again later!' }, { quoted: m });
    }
  }
};