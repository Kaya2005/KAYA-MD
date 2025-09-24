// ==================== commands/typing.js ====================
import { saveBotModes } from '../utils/botModes.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'typing',
  description: 'Active/Désactive le mode écriture (owner uniquement)',
  category: 'Owner',
  ownerOnly: true, 

  run: async (kaya, m, msg, store, args, context) => {
    try {
      
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
          { text: '❌ Utilisation : .typing on|off', contextInfo },
          { quoted: m }
        );
      }

      global.botModes.typing = action === 'on';
      saveBotModes(global.botModes);

      return kaya.sendMessage(
        m.chat,
        {
          text: global.botModes.typing
            ? '✅ Mode "typing" activé ! Le bot simulera qu’il écrit.'
            : '❌ Mode "typing" désactivé.',
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Erreur typing.js :', err);
      return kaya.sendMessage(
        m.chat,
        { text: '❌ Une erreur est survenue lors du changement du mode typing.', contextInfo },
        { quoted: m }
      );
    }
  }
};