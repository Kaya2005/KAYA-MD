// ==================== system/menuBuilder.js ====================
import { BOT_NAME, BOT_SLOGAN } from './botAssets.js';

/**
 * Construit le texte principal du menu
 */
export function buildMenuText({
  user,
  userId,
  mode,
  totalCmds,
  active,
  menuList
}) {
  return `
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
┆    ${BOT_NAME} 
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈
┆❱ user     : *${user}*
┆❱ prefix   : *${global.PREFIX || ''}*
┆❱ mode     : *${global.privateMode ? 'PRIVATE 🔒' : 'PUBLIC 🌍'}*
┆❱ cmds     : *${totalCmds}*
╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◈

${menuList}

${BOT_SLOGAN}
`.trim();
}

/**
 * Construit le texte pour une catégorie
 */
export function buildMenuCategoryText({ cat, cmds, showPrefix = false }) {
  const prefix = showPrefix ? (global.PREFIX || '') : '';
  return `
> ╢ ${cat.toUpperCase()} ♰
╭┄┄┄┄┄┄┄┄┄┄┄┄┄◈
${cmds.map(c => `┆${prefix}${c.toLowerCase()}`).join('\n')}
╰┄┄┄┄┄┄┄┄┄┄┄┄┄◈
`.trim();
}