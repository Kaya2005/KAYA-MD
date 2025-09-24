// ================= commands/recording.js =================
import { saveBotModes } from '../utils/botModes.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'recording',
  description: 'Active/Désactive le mode micro (owner uniquement)',
  category: 'Owner',
  ownerOnly: true, // ✅ le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    // ✅ Vérifie que seul le propriétaire peut utiliser
    if (!context.isOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 Commande réservée au propriétaire.', contextInfo },
        { quoted: m }
      );
    }

    const action = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(action)) {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Utilisation : .recording on|off', contextInfo },
        { quoted: m }
      );
    }

    global.botModes.recording = action === 'on';
    saveBotModes(global.botModes);

    return kaya.sendMessage(
      m.chat,
      {
        text: global.botModes.recording
          ? '🎤 Mode "recording" activé ! Le bot simulera qu’il enregistre un audio.'
          : '❌ Mode "recording" désactivé.',
        contextInfo
      },
      { quoted: m }
    );
  }
};