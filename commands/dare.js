import fetch from 'node-fetch';
import { contextInfo } from '../system/contextInfo.js';

export default {
  name: 'dare',
  description: 'Get a random dare from Shizo API',
  category: 'Fun',
  group: false,
  admin: false,
  botAdmin: false,

  run: async (sock, m, args) => {
    try {
      const chatId = m.chat;
      const shizokeys = 'shizo'; // ton clé API
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);

      if (!res.ok) {
        throw await res.text();
      }

      const json = await res.json();
      const dareMessage = json.result;

      // Envoi du message
      await sock.sendMessage(chatId, { text: dareMessage, contextInfo }, { quoted: m });
    } catch (error) {
      console.error('❌ Error in dare command:', error);
      await sock.sendMessage(chatId, { text: '❌ Failed to get dare. Please try again later!', contextInfo }, { quoted: m });
    }
  }
};