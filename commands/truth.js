import fetch from 'node-fetch';

export default {
  name: "truth",
  description: "Get a random truth question",
  category: "Fun",
  group: false,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    const chatId = m.chat;

    try {
      const shizokeys = 'shizo';
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);

      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }

      const json = await res.json();
      const truthMessage = json.result;

      await kaya.sendMessage(chatId, { text: truthMessage }, { quoted: m });

    } catch (error) {
      console.error('❌ Error in truthCommand:', error);
      await kaya.sendMessage(chatId, { text: '❌ Failed to get a truth question. Please try again later!' }, { quoted: m });
    }
  }
};