import fetch from 'node-fetch';

export default {
  name: 'meme',
  description: 'Sends a random Cheems meme',
  category: 'Fun',
  group: false,
  admin: false,
  botAdmin: false,

  run: async (sock, m) => {
    const chatId = m.chat;
    try {
      const res = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');

      if (!res.ok) throw new Error(`API responded with status ${res.status}`);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('image')) 
        throw new Error('API did not return an image');

      const imageBuffer = await res.buffer();

      const buttons = [
        { buttonId: '.meme', buttonText: { displayText: '🎭 Another Meme' }, type: 1 },
        { buttonId: '.joke', buttonText: { displayText: '😄 Joke' }, type: 1 }
      ];

      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: "> Here's your Cheems meme! 🐕",
        buttons,
        headerType: 1
      }, { quoted: m });

    } catch (err) {
      console.error('❌ Meme command error:', err);
      await sock.sendMessage(chatId, {
        text: '❌ Failed to fetch meme. Please try again later.'
      }, { quoted: m });
    }
  }
};