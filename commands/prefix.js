import config, { saveConfig } from '../config.js';

export default {
  name: 'prefix',
  description: '🔑 Change le préfixe du bot (owner uniquement)',
  category: 'Owner',
  ownerOnly: true, // ✅ le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    try {
      const newPrefix = args[0];
      if (!newPrefix) {
        return kaya.sendMessage(
          m.chat,
          { text: `❌ Utilisation : ${config.PREFIX}prefix <nouveau préfixe>` },
          { quoted: m }
        );
      }

      // ✅ Mets à jour le préfixe en mémoire
      config.PREFIX = newPrefix;

      // ✅ Sauvegarde en fichier si possible
      if (saveConfig) saveConfig({ PREFIX: newPrefix });

      return kaya.sendMessage(
        m.chat,
        { text: `✅ Préfixe changé avec succès !\nNouveau : \`${newPrefix}\`` },
        { quoted: m }
      );
    } catch (err) {
      console.error('❌ Erreur commande prefix :', err);
      return kaya.sendMessage(
        m.chat,
        { text: '⚠️ Impossible de changer le préfixe pour le moment.' },
        { quoted: m }
      );
    }
  }
};