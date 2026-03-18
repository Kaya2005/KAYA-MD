// ====================== handler.js ======================
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import config from './config.js';
import { storeMessage, handleAutoread, handleBotModes } from './system/initModules.js';
import { coreLogic } from './system/coreLogic.js';

global.botStartTime ??= Date.now();
global.startupGrace ??= { enabled: true, duration: 5000 };
setTimeout(() => {
  global.startupGrace.enabled = false;
  console.log('⚡ Startup grace terminé');
}, global.startupGrace.duration);

// ===== SETTINGS =====
const SETTINGS_FILE = './data/settings.json';
let savedSettings = {};
try { savedSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')); } catch {}
export const commands = {};
global.groupThrottle ??= savedSettings.groupThrottle || {};
global.userThrottle ??= new Set(savedSettings.userThrottle || []);
global.disabledGroups ??= new Set(savedSettings.disabledGroups || []);
global.botModes ??= savedSettings.botModes || { typing: false, recording: false, autoread: { enabled: false } };
global._mentionState ??= (() => {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'mention.json'))); } catch { return { enabled: false }; }
})();

// ===== SAVE SETTINGS =====
let saveTimeout;
export const saveSettings = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const data = {
      groupThrottle: global.groupThrottle,
      userThrottle: Array.from(global.userThrottle),
      disabledGroups: Array.from(global.disabledGroups),
      botModes: global.botModes
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
  }, 2000);
};

// ===== LOAD COMMANDS =====
let commandsLoaded = false;
export const loadCommands = async (dir = './commands') => {
  if (commandsLoaded) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) { await loadCommands(fullPath); continue; }
    if (!file.endsWith('.js')) continue;
    const module = await import(pathToFileURL(fullPath).href);
    const cmd = module.default || module;
    if (cmd?.name) commands[cmd.name.toLowerCase()] = cmd;
  }
  global.participantCommands = Object.values(commands).filter(cmd => typeof cmd.participantUpdate === 'function');
  commandsLoaded = true;
  console.log(`📂 Commandes chargées : ${Object.keys(commands).length}`);
};

// ===== smsg =====
export const smsg = (sock, m) => {
  if (!m?.message) return {};
  const msg = m.message;
  const body = msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || '';
  return {
    ...m,
    body: body.trim(),
    chat: m.key.remoteJid,
    id: m.key.id,
    fromMe: m.key.fromMe,
    sender: m.key.fromMe ? sock.user?.id : m.key.participant || m.key.remoteJid,
    isGroup: m.key.remoteJid?.endsWith('@g.us'),
    mentionedJid: msg.extendedTextMessage?.contextInfo?.mentionedJid || []
  };
};

// ===== HANDLE COMMAND =====
export async function handleCommand(sock, mRaw) {
  if (!mRaw?.message) return;
  const m = smsg(sock, mRaw);
  if (!m?.body?.trim()) return;
  await coreLogic({ sock, m, mRaw, body: m.body, commands, storeMessage, saveSettings });
}

// ===== PARTICIPANT UPDATE =====
export async function handleParticipantUpdate(sock, update) {
  for (const cmd of global.participantCommands || [])
    await cmd.participantUpdate(sock, update).catch(() => {});
}

export default handleCommand;