import { BOT_NAME, BOT_SLOGAN } from './botAssets.js';

export function buildMenuText({
  user,
  userId,
  prefix = '.',
  mode,
  totalCmds,
  active,
  menuList
}) {
  return `
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
┆ ✦ ${BOT_NAME} ✦
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
┆❱ user     : *${user}*
┆❱ prefix   : *${prefix}*
┆❱ mode     : *${mode}*
┆❱ cmds     : *${totalCmds}*
┆❱ active   : *${active}*
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈

${menuList}

${BOT_SLOGAN}
`.trim();
}

export function buildMenuCategoryText({ cat, cmds }) {
  return `
> ╢ ${cat.toUpperCase()} ♰
╭┄┄┄┄┄┄┄┄┄┄┄┄┄◈
${cmds.map(c => `┆${c.toLowerCase()}`).join('\n')}
╰┄┄┄┄┄┄┄┄┄┄┄┄┄◈
`.trim();
}