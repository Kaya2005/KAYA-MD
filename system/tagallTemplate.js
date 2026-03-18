// ==================== system/tagallTemplate.js ====================
import { getBotName, BOT_VERSION } from './botAssets.js';

export function buildTagAllMessage({
  date,
  time,
  membersCount,
  mentionText,
  totalCmds,
  thumbnailBuffer
}) {
  const messageText = `
╔═══  TAG ALL  ═══
📅 Date    : ${date}
⏰ Time    : ${time}
👥 Members : ${membersCount}
╚═══════════════════

${mentionText}
`.trim();

  // ===================== PREVIEW =====================
  const externalAdReply = {
    title: `WELCOME TO ${getBotName()}`,
    body: `${totalCmds} COMMANDS • v${BOT_VERSION}`,
    mediaType: 1,
    renderLargerThumbnail: true,
    showAdAttribution: true,
    thumbnail: thumbnailBuffer
  };

  return { messageText, externalAdReply };
}