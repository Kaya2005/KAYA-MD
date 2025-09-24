// ==================== commands/tagall.js ====================
import moment from 'moment';
import { contextInfo } from '../utils/contextInfo.js';

moment.locale('fr');

export default {
  name: "tagall",
  alias: ["mention", "everyone"],
  description: "📢 Mentionne tous les membres du groupe avec un message personnalisé et élégant.",
  category: "Groupe",
  group: true,
  admin: false, 

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          { text: "⛔ Cette commande est uniquement disponible dans les groupes.", contextInfo },
          { quoted: m }
        );
      }

      const metadata = await kaya.groupMetadata(m.chat);
      const participants = metadata.participants.map(p => p.id);

      const date = moment().format('dddd D MMMM YYYY');
      const time = moment().format('HH:mm:ss');

      
      const numbers = participants.map(p => p.split('@')[0]);

      
      const countryCodes = [...new Set(numbers.map(num => num.slice(0, 3)))];
      const totalCountries = countryCodes.length;

      const mentionList = numbers.map(num => `👤 @${num}`).join('\n');

      const fullMessage =
`╔════════════════╗
║   KAYA MD TAG ALL
╚════════════════╝

📅 Date: ${date}
⏰ Heure: ${time}
👥 Membres: ${participants.length}
🌍 ${totalCountries} MEMBRES 

👥 Membres :
${mentionList}`;

      
      await kaya.sendMessage(
        m.chat,
        {
          text: fullMessage,
          mentions: participants
        },
        { quoted: m } 
      );

    } catch (error) {
      console.error("Erreur dans la commande tagall :", error);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Une erreur est survenue lors de la mention.", contextInfo },
        { quoted: m }
      );
    }
  }
};