// ==================== system/menuBuilder.js ====================
import { BOT_NAME, BOT_SLOGAN } from './botAssets.js';

/* ==================== TIME ==================== */
function pad(n) {
  return String(n).padStart(2, '0');
}

function getTime() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDate() {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear())}`;
}

/* ==================== HEADER FUSION NX + STYLE BOT ==================== */
function buildHeader({ user, totalCmds }) {
  return `
▰▰▰▰▰▰▰▰▰▰
➠ User: *${user}*
➠ Prefix: *${global.PREFIX || ''}*
➠ Mode: *${global.privateMode ? 'PRIVATE 🔒' : 'PUBLIC 🌍'}*
➠ Time: *${getTime()}*
➠ Date: *${getDate()}*
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

   〘 COMMANDS 〙

${menuList}

${BOT_SLOGAN}
`.trim();
}

/* ==================== CATEGORY MENU (FUSION PARFAITE) ==================== */
export function buildMenuCategoryText({
  cat,
  cmds = [],
  showPrefix = false
}) {
  const prefix = showPrefix ? (global.PREFIX || '') : '';

  if (!cmds.length) return '';

  return `
> ╢ ${cat.toUpperCase()} ♰
╭▰▰▰▰▰▰▰▰▰▰◈
${cmds
  .filter(Boolean)
  .map(c => `❏ ${prefix}${c.toLowerCase()}`)
  .join('\n')}
╰▰▰▰▰▰▰▰▰▰▰◈
`.trim();
}