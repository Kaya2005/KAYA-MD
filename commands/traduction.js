// ==================== commands/traduc.js ====================
import axios from 'axios';
import { contextInfo } from '../utils/contextInfo.js'; 

const languages = {
  fr: 'français',
  en: 'anglais',
  ar: 'arabe',
  es: 'espagnol',
  de: 'allemand',
  pt: 'portugais',
  it: 'italien',
  ru: 'russe',
  zh: 'chinois',
  ja: 'japonais',
  ko: 'coréen',
  hi: 'hindi',
  sw: 'swahili',
  ha: 'haoussa',
  yo: 'yoruba',
  ln: 'lingala',
  nl: 'néerlandais',
  pl: 'polonais',
  tr: 'turc',
  ro: 'roumain',
  id: 'indonésien',
  th: 'thaï',
  fa: 'persan',
  uk: 'ukrainien',
  vi: 'vietnamien',
  bn: 'bengali',
  ur: 'ourdou',
  tl: 'tagalog',
  he: 'hébreu'
};

export default {
  name: 'traduc',
  description: 'Traduit un message en une langue spécifique',
  category: 'Utilitaires',

  run: async (kaya, m, msg, store, args) => {
    try {
      const code = args[0]?.toLowerCase();
      const quotedText = m.quoted?.text;

      if (!code || !languages[code]) {
        const listLang = Object.entries(languages)
          .map(([key, name]) => `│ ➜ *${key}* : ${name}`)
          .join('\n');

        return kaya.sendMessage(
          m.chat,
          {
            text: `╭─「 🌍 *Langues disponibles - KAYA-MD* 」─⬣\n${listLang}\n╰──────────────⬣\n📌 *Utilise :* .traduc fr (réponds à un message)`,
            contextInfo
          },
          { quoted: m }
        );
      }

      if (!quotedText) {
        return kaya.sendMessage(
          m.chat,
          {
            text: `╭─「 🌍 *Traduction KAYA-MD* 」─⬣\n│ ❌ Réponds à un message à traduire.\n╰──────────────⬣`,
            contextInfo
          },
          { quoted: m }
        );
      }

      const prompt = `Traduis ce message en ${languages[code]} : ${quotedText}`;
      const response = await axios.post(
        'https://stablediffusion.fr/gpt3/predict',
        { prompt },
        {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://stablediffusion.fr/chatgpt3',
            'Origin': 'https://stablediffusion.fr',
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );

      const result = response.data.message;
      if (!result) {
        return kaya.sendMessage(
          m.chat,
          {
            text: `╭─「 🌍 *Traduction KAYA-MD* 」─⬣\n│ ❌ Traduction indisponible\n╰──────────────⬣`,
            contextInfo
          },
          { quoted: m }
        );
      }

      
      await kaya.sendMessage(m.chat, { text: result }, { quoted: m });

    } catch (err) {
      console.error(err);
      return kaya.sendMessage(
        m.chat,
        {
          text: `╭─「 🌍 *Traduction KAYA-MD* 」─⬣\n│ ❌ Une erreur est survenue : ${err.message}\n╰──────────────⬣`,
          contextInfo
        },
        { quoted: m }
      );
    }
  }
};