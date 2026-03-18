import { BOT_VERSION, getBotName } from './botAssets.js';

/**
 * Construit le message de bienvenue stylé (épuré)
 */
export function buildWelcomeMessage({
  username,
  groupName,
  groupSize,
  creationDate,
  date
}) {
  const messageText = `
╔═━⊷  ẄELCOME  ⊶━═╗
│
│ 👋 Hello       : ${username}
│ 🏷️ Group       : ${groupName}
│ 👥 Members     : ${groupSize}
│ 🏗️ Created on  : ${creationDate}
│ 📅 Today       : ${date}
│
╚═━⊷ Have fun! ⊶━═╝
`.trim();

  return { messageText };
}