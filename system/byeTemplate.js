import { BOT_NAME } from './botAssets.js';

export function buildByeMessage({ username, groupName, membersCount }) {
  return `
╭━━〔 ${BOT_NAME} 〕━━⬣
├ 👋 Au revoir ${username}
├ 🎓 Groupe : *${groupName}*
├ 👥 Membres restants : ${membersCount}
╰─────────────────────⬣
`.trim();
}