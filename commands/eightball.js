import { getContextInfo } from '../system/contextInfo.js';

const eightBallResponses = [
  "🎱 Yes, definitely!",
  "🎱 No way!",
  "🎱 Ask again later.",
  "🎱 It is certain.",
  "🎱 Very doubtful.",
  "🎱 Without a doubt.",
  "🎱 My reply is no.",
  "🎱 Signs point to yes."
];

export default {
  name: '8ball',
  description: 'Ask the magic 8-Ball a question and get an answer',
  category: 'Fun',
  group: false,
  admin: false,
  botAdmin: false,

  run: async (sock, m, args) => {
    try {
      const chatId = m.chat;
      const question = args.join(' ').trim();

      if (!question) {
        return sock.sendMessage(
          chatId,
          {
            text: '❌ Please ask a question to get an answer!',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      const randomResponse =
        eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

      await sock.sendMessage(
        chatId,
        {
          text: `💬 *Your question:* ${question}\n\n${randomResponse}`,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Error in 8ball command:', err);

      await sock.sendMessage(
        m.chat,
        {
          text: '❌ Something went wrong. Try again later!',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};