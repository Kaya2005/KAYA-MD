// ==================== commands/chatbot.js ====================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '../data/chatbot.json');

export default {
  name: 'chatbot',
  description: 'Active/désactive le ChatBot : privé, groupes ou global (owner uniquement)',
    category: 'AI',

  async execute(Kaya, m, args) {
    try {
      // 🔐 Owner uniquement
      if (!m.fromMe) return;

      const db = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : { mode: 'off' };
      const mode = (args[0] || '').toLowerCase();

      switch (mode) {
        case 'on':
        case 'private':
          db.mode = 'on';
          break;
        case 'group':
          db.mode = 'group';
          break;
        case 'all':
          db.mode = 'all';
          break;
        case 'off':
          db.mode = 'off';
          break;
        default:
          return Kaya.sendMessage(
            m.chat,
            { text: '❌ Utilisation : .chatbot on | group | all | off (owner uniquement)' },
            { quoted: m }
          );
      }

      fs.writeFileSync(file, JSON.stringify(db, null, 2));
      return Kaya.sendMessage(m.chat, { text: `✅ Mode ChatBot défini sur : ${db.mode}` }, { quoted: m });

    } catch (err) {
      console.error('❌ Erreur ChatBot:', err);
      return Kaya.sendMessage(m.chat, { text: '⚠️ Une erreur est survenue avec le ChatBot.' }, { quoted: m });
    }
  }
};

// ==================== Fonction de réponse automatique ====================
export async function chatBotReply(Kaya, m) {
  try {
    if (!fs.existsSync(file)) return;
    const db = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (db.mode === 'off') return;

    const isGroup = m.key.remoteJid.endsWith('@g.us');
    const chatId = m.chat;

    // Répond seulement aux messages texte
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text;
    if (!text) return;

    // Vérifie le mode
    if (db.mode === 'on' && isGroup) return;     // Privé uniquement
    if (db.mode === 'group' && !isGroup) return; // Groupes uniquement

    // ✅ Appel API GPT pour une réponse naturelle
    const response = await axios.get(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`);
    const answer = response.data?.success && response.data?.result?.prompt
      ? response.data.result.prompt
      : '❌ Je n’ai pas de réponse pour le moment.';

    // Envoi de la réponse comme une personne normale (sans contextInfo)
    await Kaya.sendMessage(chatId, { text: answer });

  } catch (err) {
    console.error('❌ Erreur chatBotReply:', err);
  }
}