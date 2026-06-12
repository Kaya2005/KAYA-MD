import { saveBotModes } from '../system/botStatus.js';
import { getContextInfo } from '../system/contextInfo.js';

export default {
  name: 'recording',
  description: 'Enable or disable automatic audio recording presence (KAYA-MD)',
  category: 'Owner',

  run: async (kaya, m, args) => {
    try {
      // 🔐 Owner only
      if (!m.fromMe) return;

      const action = args[0]?.toLowerCase();
      if (!['on', 'off', 'status'].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          {
            text: '🎤 Usage: .recording on|off|status',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // Initialize bot modes safely
      global.botModes = global.botModes || {};
      global.botModes.recording = global.botModes.recording || false;

      if (action === 'on') {
        global.botModes.recording = true;
        saveBotModes(global.botModes);

        // Trigger presence for confirmation
        await kaya.sendPresenceUpdate('recording', m.chat);
        setTimeout(() => kaya.sendPresenceUpdate('paused', m.chat), 2000);

        return kaya.sendMessage(
          m.chat,
          {
            text: '✅ *Recording mode enabled!* \n\nKAYA-MD will show "recording" status for 3 seconds on each received message.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      if (action === 'off') {
        global.botModes.recording = false;
        saveBotModes(global.botModes);

        // Stop immediately
        await kaya.sendPresenceUpdate('paused', m.chat);

        return kaya.sendMessage(
          m.chat,
          {
            text: '❌ *Recording mode disabled.*',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      if (action === 'status') {
        const isActive = global.botModes.recording;

        return kaya.sendMessage(
          m.chat,
          {
            text: `🎤 Recording mode: ${isActive ? '✅ ENABLED' : '❌ DISABLED'} (KAYA-MD)`,
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error('❌ recording.js error:', err);

      return kaya.sendMessage(
        m.chat,
        {
          text: '❌ An error occurred while managing recording mode (KAYA-MD).',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  }
};