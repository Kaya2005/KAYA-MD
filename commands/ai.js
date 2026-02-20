import axios from 'axios';

export default {
  name: 'ai',
  description: 'Pose une question à l’IA via API publique',
  run: async (kaya, m, args) => {
    const chatId = m.chat;
    if (!args.length) return kaya.sendMessage(chatId, { text: '❌ Pose une question à l’IA !' }, { quoted: m });

    const question = args.join(' ');

    try {
      const res = await axios.post('https://api.luan.tools/api/tasks', {
        prompt: question,
        model: 'text-davinci-003',
      });

      const answer = res.data?.output?.[0]?.content || '❌ Pas de réponse de l’IA';
      await kaya.sendMessage(chatId, { text: `💬 Question : ${question}\n\n🤖 Réponse : ${answer}` }, { quoted: m });

    } catch (err) {
      console.error('❌ AI error:', err);
      await kaya.sendMessage(chatId, { text: '❌ L’IA publique ne répond pas pour le moment.' }, { quoted: m });
    }
  }
};