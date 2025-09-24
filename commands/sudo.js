// ==================== commands/sudo.js ====================
import config from '../config.js';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'sudo',
  description: '➕ Ajoute un nouvel owner (réservé au propriétaire principal)',
  category: 'Owner',
  ownerOnly: true, // ✅ le handler bloque déjà les non-owners

  run: async (kaya, m, msg, store, args, context) => {
    // ✅ Vérifie que seul le propriétaire peut utiliser
    if (!context.isOwner) {
      return kaya.sendMessage(
        m.chat,
        { text: '🚫 *Seul le propriétaire principal peut utiliser cette commande.*', contextInfo },
        { quoted: m }
      );
    }

    let targetId;
    if (m.quoted?.sender) {
      targetId = m.quoted.sender.split('@')[0].replace(/\D/g, '').trim();
    } else if (args[0]) {
      targetId = args[0].replace(/\D/g, '').trim();
    } else {
      return kaya.sendMessage(
        m.chat,
        { text: '❌ *Fournis un numéro ou réponds à un message pour ajouter comme owner.*', contextInfo },
        { quoted: m }
      );
    }

    let owners = config.OWNER_NUMBER.split(',')
      .map(o => o.split('@')[0].replace(/\D/g, '').trim());

    if (owners.includes(targetId)) {
      return kaya.sendMessage(
        m.chat,
        { text: `ℹ️ *@${targetId}* est déjà owner.`, mentions: [targetId + '@s.whatsapp.net'], contextInfo },
        { quoted: m }
      );
    }

    owners.push(targetId);
    if (config.saveConfig) config.saveConfig({ OWNER_NUMBER: owners.join(',') });

    await kaya.sendMessage(
      m.chat,
      {
        text: `╭━━〔 👑 AJOUT OWNER 〕━━⬣
├ 📲 Numéro : @${targetId}
├ ✅ Statut : *Ajouté comme OWNER avec succès !*
├ 🔐 Accès : *Total au bot KAYA-MD*
╰────────────────────⬣`,
        mentions: [targetId + '@s.whatsapp.net'],
        contextInfo
      },
      { quoted: m }
    );
  }
};