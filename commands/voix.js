import { getAudioUrl } from '../lib/tts.js';

export default {
  name: 'voice',
  description: '🎤 Converts text into a voice message',
  category: 'General',
  ownerOnly: false, 

  run: async (kaya, m, args) => {
    try {
      const text = args.join(' ');
      if (!text) {
        return kaya.sendMessage(
          m.chat,
          { text: '❌ Please provide text to convert into voice.\nExample: `.voice Hello everyone!`' },
          { quoted: m }
        );
      }

      // Generate the TTS audio (language set to French)
      const url = await getAudioUrl(text, { lang: 'fr' });
      if (!url) throw new Error('Invalid audio URL');

      // Send audio as a voice note
      await kaya.sendMessage(
        m.chat,
        {
          audio: { url },
          mimetype: 'audio/mpeg',
          ptt: true 
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ voice command error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ An error occurred while generating the voice message.' },
        { quoted: m }
      );
    }
  }
};