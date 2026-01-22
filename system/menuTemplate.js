import { BOT_NAME, BOT_SLOGAN, BOT_VERSION } from './botAssets.js';

export function buildMenuText({ date, user, uptime, totalCmds, mode, menuList }) {
  return `
       ▉ \`${BOT_NAME}\` ▉
▰▰▰▰▰▰▰▰▰▰▰▰▰▰
*📅 Date        : ${date}*
*👤 User        : @${user}*
*⚡ Uptime      : ${uptime}*
*🧩 Commands    : ${totalCmds}*
*🌐 Bot Mode    : ${mode}*
*🧪 Bot Version : v${BOT_VERSION}*
▰▰▰▰▰▰▰▰▰▰▰▰▰▰

╭───▰ \`𝐌𝐄𝐍𝐔\`  ▰───╮
${menuList}
╰─────────────────╯

${BOT_SLOGAN}

 *Reply with a number*
`.trim();
}

export function buildMenuCategoryText({ cat, cmds }) {
  return `
*▉『 \`${cat} MENU\` 』▉*
▰▰▰▰▰▰▰▰▰▰▰▰▰

${cmds.map(c => `• ${c}`).join('\n')}

▰▰▰▰▰▰▰▰▰▰▰▰▰
${BOT_SLOGAN}
`.trim();
}