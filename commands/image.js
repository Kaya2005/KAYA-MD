// ==================== commands/img.js ====================
import axios from 'axios';

export default {
  name: 'img',
  alias: ['image', 'picture'],
  category: 'AI',
  description: 'Generate an image from a prompt',
  usage: '.img <prompt> | reply to a message',

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
          '';
      } else {
        prompt = args.join(' ');
      }

      if (!prompt.trim()) {
        return sock.sendMessage(
          m.chat,
          { text: '❌ Please provide a prompt for image generation.\nExample: .img a beautiful sunset over mountains' },
          { quoted: m }
        );
      }

      // ⏳ Reaction (processing)
      await sock.sendMessage(m.chat, { text: '🎨 Generating your image... Please wait.' }, { quoted: m });

      // ================== API IMAGE GENERATION ==================
      const enhancedPrompt = enhancePrompt(prompt);
      const response = await axios.get(
        `https://shizoapi.onrender.com/api/ai/imagine?apikey=shizo&query=${encodeURIComponent(enhancedPrompt)}`,
        { responseType: 'arraybuffer' }
      );

      const imageBuffer = Buffer.from(response.data);

      // ================== SEND IMAGE ==================
      await sock.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `🎨 Generated image for prompt: "${prompt}"`
      }, { quoted: m });

    } catch (error) {
      console.error('❌ IMG command error:', error);
      await sock.sendMessage(
        m.chat,
        { text: '❌ Failed to generate image. Please try again later.' },
        { quoted: m }
      );
    }
  }
};

// ================== FUNCTION TO ENHANCE PROMPT ==================
function enhancePrompt(prompt) {
  const qualityEnhancers = [
    'high quality', 'detailed', 'masterpiece', 'best quality', 'ultra realistic',
    '4k', 'highly detailed', 'professional photography', 'cinematic lighting', 'sharp focus'
  ];

  const numEnhancers = Math.floor(Math.random() * 2) + 3; // 3-4
  const selectedEnhancers = qualityEnhancers.sort(() => Math.random() - 0.5).slice(0, numEnhancers);

  return `${prompt}, ${selectedEnhancers.join(', ')}`;
}