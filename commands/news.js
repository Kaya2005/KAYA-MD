import axios from 'axios';

export default {
  name: "news",
  description: "Get the latest top 5 news headlines",
  category: "Fun",
  group: false,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    const chatId = m.chat;

    try {
      const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c'; // Remplace par ta clé NewsAPI
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
      const articles = response.data.articles.slice(0, 5);

      if (!articles.length) {
        await kaya.sendMessage(chatId, { text: '📰 No news available right now. Please try later!' }, { quoted: m });
        return;
      }

      let newsMessage = '📰 *Top 5 News Headlines*:\n\n';
      articles.forEach((article, index) => {
        newsMessage += `*${index + 1}. ${article.title}*\n${article.description || 'No description'}\n🔗 [Read more](${article.url})\n\n`;
      });

      await kaya.sendMessage(chatId, { text: newsMessage, mentions: [m.sender] }, { quoted: m });

    } catch (error) {
      console.error('❌ Error in newsCommand:', error);
      await kaya.sendMessage(chatId, { text: '❌ Sorry, I could not fetch news right now. Try again later!' }, { quoted: m });
    }
  }
};