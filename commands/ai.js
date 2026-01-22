// ==================== commands/ai.js ====================
import axios from 'axios';
import fetch from 'node-fetch';

export default {
  name: 'ai',
  alias: ['gpt', 'chat', 'gemini'],
  category: 'AI',
  description: 'Chat with an artificial intelligence',
  usage: '.ai <question> | reply to a message',

  run: async (sock, m, args) => {
    try {
      let prompt = '';

      // ================== GET TEXT (message or reply) ==================
      if (m.quoted?.message) {
        const msg = m.quoted.message;
        prompt =
          msg.conversation ||
          msg.extendedTextMessage?.text ||
          msg.imageMessage?.caption ||
          msg.videoMessage?.caption ||
          msg.documentMessage?.caption ||
          '';
      } else {
        prompt = args.join(' ');
      }

      if (!prompt.trim()) {
        return sock.sendMessage(
          m.chat,
          { text: '❌ Please provide a question or reply to a message.\n\nExample:\n.ai Explain JavaScript' },
          { quoted: m }
        );
      }

      // ⏳ Reaction (processing)
      await sock.sendMessage(m.chat, {
        react: { text: '🤖', key: m.key }
      });

      // ================== GPT API (PRIORITY) ==================
      try {
        const gpt = await axios.get(
          `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(prompt)}`,
          { timeout: 20000 }
        );

        if (gpt.data?.status && gpt.data?.result) {
          return sock.sendMessage(
            m.chat,
            { text: gpt.data.result },
            { quoted: m }
          );
        }
      } catch (e) {
        console.log('GPT API failed, trying Gemini fallback...');
      }

      // ================== GEMINI FALLBACK ==================
      const geminiApis = [
        `https://vapis.my.id/api/gemini?q=${encodeURIComponent(prompt)}`,
        `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(prompt)}`,
        `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(prompt)}`,
        `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(prompt)}`
      ];

      for (const api of geminiApis) {
        try {
          const res = await fetch(api, { timeout: 20000 });
          const data = await res.json();

          const answer =
            data.result ||
            data.answer ||
            data.message ||
            data.data;

          if (answer) {
            return sock.sendMessage(
              m.chat,
              { text: answer },
              { quoted: m }
            );
          }
        } catch {
          continue;
        }
      }

      throw new Error('All AI APIs failed');

    } catch (err) {
      console.error('❌ AI error:', err);
      await sock.sendMessage(
        m.chat,
        { text: '❌ Failed to get an AI response. Please try again later.' },
        { quoted: m }
      );
    }
  }
};