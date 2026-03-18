import { BOT_VERSION, getBotName } from './botAssets.js';

export function buildWelcomeMessage({
  username,
  groupName,
  groupSize,
  creationDate,
  date,
  totalCmds,
  thumbnailBuffer
}) {
  const messageText = `
╭━━━〔  ẄELCOME  〕━━━⬣
│
├ 👋 Hello ${username}!
├ 🏷️ Group: *${groupName}*
├ 👥 Members: *${groupSize}*
├ 🏗️ Created on: ${creationDate}
├ 📅 Today: ${date}
│
╰━━━━━━━━━━━━━━━━⬣
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