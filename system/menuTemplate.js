// ==================== system/menuBuilder.js ====================
import { BOT_NAME, BOT_SLOGAN } from './botAssets.js';

/* ==================== FORMAT TIME ==================== */
function pad(n) {
  return String(n).padStart(2, '0');
}

function getTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDate() {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ==================== HEADER FUSIONNÉ ==================== */
function buildHeader({ user, totalCmds }) {
  return `
   ▉ \`${BOT_NAME}\` ▉
  ▰▰▰▰▰▰▰▰▰▰
 ❱ user   : *${user}*
 ❱ prefix : *${global.PREFIX || ''}*
 ❱ mode   : *${global.privateMode ? 'PRIVATE 🔒' : 'PUBLIC 🌍'}*
 ❱ cmds   : *${totalCmds}*
  ______________________

`.trim();
}

/* ==================== MENU PRINCIPAL ==================== */
export function buildMenuText({
  user,
  totalCmds,
  menuList
}) {
  return `
${buildHeader({ user, totalCmds })}

${menuList}
 ${BOT_SLOGAN}
`.trim();
}

/* ==================== CATÉGORIE MENU ==================== */
export function buildMenuCategoryText({ cat, cmds, showPrefix = false }) {
  const prefix = showPrefix ? (global.PREFIX || '') : '';

  return `
> ╢ ${cat.toUpperCase()} ♰
╭▰▰▰▰▰▰▰▰▰▰◈
${cmds.map(c => `┆${prefix}${c.toLowerCase()}`).join('\n')}
╰▰▰▰▰▰▰▰▰▰▰◈
`.trim();
}