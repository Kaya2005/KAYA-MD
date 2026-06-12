import fetch from 'node-fetch';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'dare',
  description: 'Get a random dare from Shizo API',
  category: 'Fun',
  group: false,
  admin: false,
  botAdmin: false,

  run: async (sock, m, args) => {
    const chatId = m.chat;

    try {
      const shizokeys = 'shizo';
      const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);

      if (!res.ok) {
        throw await res.text();
      }

      const json = await res.json();
      const dareMessage = json.result;

      await sock.sendMessage(
        chatId,
        {
          text: dareMessage,
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('❌ Error in dare command:', error);

      await sock.sendMessage(
        chatId,
        {
          text: '❌ Failed to get dare. Please try again later!',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};