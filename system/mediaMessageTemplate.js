import { BOT_NAME } from './botAssets.js';

/**
 * Génère un message stylé pour les fichiers uploadés
 * @param {string} url - Lien du fichier
 * @param {string} [label="Link generated successfully!"] - Texte personnalisé
 * @returns {string} - Message formaté
 */
export function buildMediaLinkMessage(url, label = 'Link generated successfully!') {
  return `
╭────「 ${BOT_NAME} 」────⬣
│ 📤 ${label}
│ 🔗 Catbox Link:
│ ${url}
╰──────────────────⬣`.trim();
}