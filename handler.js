// ==================== handler.js ====================
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import config from './config.js';
import { storeMessage } from './system/initModules.js';
import { coreLogic } from './system/coreLogic.js';

// ======= Startup Grace =======
global.botStartTime ??= Date.now();
global.startupGrace ??= { enabled: true, duration: 20000 };
setTimeout(() => {
  global.startupGrace.enabled = false;
  console.log('⚡ Startup grace terminé');
}, global.startupGrace.duration);

// ======= Gestion persistante =======
const SETTINGS_FILE = './data/settings.json';
let savedSettings = {};
try {
  savedSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
} catch {
  console.log('⚠️ Pas de sauvegarde, valeurs par défaut.');
}

// ======= Globals =======
const commands = {};
export { commands }; // <-- Export nommé ajouté ici

global.groupThrottle ??= savedSettings.groupThrottle || {};
global.userThrottle ??= new Set(savedSettings.userThrottle || []);
global.disabledGroups ??= new Set(savedSettings.disabledGroups || []);
global.botModes ??= savedSettings.botModes || { typing: false, recording: false, autoread: { enabled: false } };

// ======= Sauvegarde =======
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

// ======= Chargement commandes =======
let commandsLoaded = false;
export const loadCommands = async (dir = './commands') => {
  if (commandsLoaded) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await loadCommands(fullPath);
      continue;
    }
    if (!file.endsWith('.js')) continue;
    const module = await import(pathToFileURL(fullPath).href);
    const cmd = module.default || module;
    if (cmd?.name) commands[cmd.name.toLowerCase()] = cmd;
  }
  global.participantCommands = Object.values(commands).filter(cmd => typeof cmd.participantUpdate === 'function');
  commandsLoaded = true;
};

// ======= smsg =======
export const smsg = (sock, m) => {
  if (!m?.message) return {};
  const msg = m.message;
  const body =
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    '';
  return {
    ...m,
    body,
    chat: m.key.remoteJid,
    id: m.key.id,
    fromMe: m.key.fromMe,
    sender: m.key.fromMe ? sock.user.id : (m.key.participant || m.key.remoteJid || ''),
    isGroup: m.key.remoteJid.endsWith('@g.us'),
    mentionedJid: msg.extendedTextMessage?.contextInfo?.mentionedJid || []
  };
};

// ======= HANDLE COMMANDES =======
export async function handleCommand(sock, mRaw) {
  if (!mRaw?.message) return;
  const m = smsg(sock, mRaw);
  const body = m.body?.trim();
  if (!body) return;

  const context = {
    sock,
    m,
    mRaw,
    body,
    commands,
    storeMessage,
    saveSettings
  };

  await coreLogic(context);
}

// ======= HANDLE PARTICIPANT UPDATE =======
export async function handleParticipantUpdate(sock, update) {
  for (const cmd of global.participantCommands || [])
    await cmd.participantUpdate(sock, update).catch(() => {});
}

// ======= Export par défaut =======
export default handleCommand;