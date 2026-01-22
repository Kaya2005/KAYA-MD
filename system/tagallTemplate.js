import { BOT_NAME } from './botAssets.js';

export function buildTagAllMessage({
  date,
  time,
  membersCount,
  mentionText
}) {
  return `
╔══ ${BOT_NAME} ══
📅 Date    : ${date}
⏰ Heure   : ${time}
👥 Membres : ${membersCount}
╚═══════════════

${mentionText}
`.trim();
}