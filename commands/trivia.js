import axios from 'axios';

const triviaGames = {};

export default {
  name: "trivia",
  description: "Start a trivia question or answer the current one",
  category: "Fun",
  group: false,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    const chatId = m.chat;
    const answer = args.join(' ').trim();

    try {
      // Si l'utilisateur fournit une réponse
      if (answer) {
        const game = triviaGames[chatId];
        if (!game) {
          return kaya.sendMessage(chatId, { text: '❌ No trivia game is currently running.' }, { quoted: m });
        }

        if (answer.toLowerCase() === game.correctAnswer.toLowerCase()) {
          await kaya.sendMessage(chatId, { text: `✅ Correct! The answer is *${game.correctAnswer}*` }, { quoted: m });
        } else {
          await kaya.sendMessage(chatId, { text: `❌ Wrong! The correct answer was *${game.correctAnswer}*` }, { quoted: m });
        }

        delete triviaGames[chatId];
        return;
      }

      // Sinon, démarrer un nouveau jeu
      if (triviaGames[chatId]) {
        return kaya.sendMessage(chatId, { text: '❌ A trivia game is already in progress!' }, { quoted: m });
      }

      const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const questionData = response.data.results[0];

      triviaGames[chatId] = {
        question: questionData.question,
        correctAnswer: questionData.correct_answer,
        options: [...questionData.incorrect_answers, questionData.correct_answer].sort()
      };

      const optionsText = triviaGames[chatId].options
        .map((opt, i) => `▢ ${i + 1}. ${opt}`)
        .join('\n');

      await kaya.sendMessage(chatId, {
        text: `🎯 *Trivia Time!*\n\n*Question:* ${triviaGames[chatId].question}\n\n*Options:*\n${optionsText}\n\nReply with .trivia <your answer> to answer!`
      }, { quoted: m });

    } catch (error) {
      console.error('❌ Error in trivia command:', error);
      await kaya.sendMessage(chatId, { text: '❌ Failed to fetch trivia question. Try again later.' }, { quoted: m });
    }
  }
};