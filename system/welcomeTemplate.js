import { BOT_NAME } from './botAssets.js';

export function buildWelcomeMessage({
  username,
  groupName,
  groupSize,
  creationDate,
  date
}) {
  return `
╭━━〔 ${BOT_NAME} 〕━━⬣
├ 👤 Bienvenue ${username}
├ 🎓 Groupe : *${groupName}*
├ 👥 Membres : ${groupSize}
├ 🏗️ Créé le : ${creationDate}
├ 📆 Date : ${date}
╰─────────────────────⬣
`.trim();
}