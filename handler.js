// ====================== handler.js ======================

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import config from './config.js';

import {
  storeMessage,
  handleAutoread,
  handleBotModes
} from './system/initModules.js';

import { coreLogic } from './system/coreLogic.js';

// ========================================
// GLOBALS
// ========================================

global.botStartTime ??= Date.now();

global.startupGrace ??= {
  enabled: true,
  duration: 5000
};

setTimeout(() => {
  global.startupGrace.enabled = false;
  console.log('⚡ Startup grace terminé');
}, global.startupGrace.duration);

// ========================================
// SETTINGS
// ========================================

const SETTINGS_FILE = './data/settings.json';

let savedSettings = {};

try {
  savedSettings = JSON.parse(
    fs.readFileSync(SETTINGS_FILE, 'utf-8')
  );
} catch {}

// ========================================
// GLOBAL STATES
// ========================================

export const commands = {};

global.groupThrottle ??=
  savedSettings.groupThrottle || {};

global.userThrottle ??=
  new Set(savedSettings.userThrottle || []);

global.disabledGroups ??=
  new Set(savedSettings.disabledGroups || []);

global.botModes ??=
  savedSettings.botModes || {
    typing: false,
    recording: false,
    autoread: { enabled: false }
  };

global._mentionState ??= (() => {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          'data',
          'mention.json'
        )
      )
    );
  } catch {
    return { enabled: false };
  }
})();

// ========================================
// SAVE SETTINGS
// ========================================

let saveTimeout;

export const saveSettings = () => {
  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    try {
      const data = {
        groupThrottle: global.groupThrottle,

        userThrottle: Array.from(
          global.userThrottle
        ),

        disabledGroups: Array.from(
          global.disabledGroups
        ),

        botModes: global.botModes
      };

      fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(data, null, 2)
      );

    } catch (e) {
      console.error(
        'Erreur saveSettings :',
        e
      );
    }

  }, 2000);
};

// ========================================
// LOAD COMMANDS
// ========================================

let commandsLoaded = false;

export const loadCommands = async (
  dir = './commands'
) => {

  if (commandsLoaded) return;

  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {

      const fullPath = path.join(dir, file);

      // ================================
      // Recursive dossiers
      // ================================

      if (
        fs.statSync(fullPath).isDirectory()
      ) {
        await loadCommands(fullPath);
        continue;
      }

      // ================================
      // Ignore non-js
      // ================================

      if (!file.endsWith('.js')) {
        continue;
      }

      // ================================
      // Import commande sécurisé
      // ================================

      try {

        const module = await import(
          pathToFileURL(fullPath).href
        );

        const cmd =
          module.default || module;

        if (
          cmd &&
          typeof cmd === 'object' &&
          cmd.name
        ) {

          commands[
            cmd.name.toLowerCase()
          ] = cmd;
        }

      } catch (e) {

        console.error(
          `❌ Erreur commande ${file}`,
          e
        );
      }
    }

    // ================================
    // Cache participant commands
    // ================================

    global.participantCommands =
      Object.values(commands).filter(
        cmd =>
          typeof cmd.participantUpdate ===
          'function'
      );

    commandsLoaded = true;

    console.log(
      `📂 Commandes chargées : ${Object.keys(commands).length}`
    );

  } catch (e) {

    console.error(
      'Erreur loadCommands :',
      e
    );
  }
};

// ========================================
// SMSG ULTRA OPTIMISÉ
// ========================================

export const smsg = (sock, m) => {

  try {

    if (!m?.message) return {};

    const msg = m.message;

    // ================================
    // Type message
    // ================================

    const messageType =
      Object.keys(msg)[0];

    const content =
      msg[messageType] || {};

    // ================================
    // Body ultra rapide
    // ================================

    const body =
      msg.conversation ||
      content.text ||
      content.caption ||
      '';

    // ================================
    // Context info
    // ================================

    const contextInfo =
      content.contextInfo || {};

    return {

      ...m,

      body: body.trim(),

      chat: m.key.remoteJid,

      id: m.key.id,

      fromMe: m.key.fromMe,

      sender:
        m.key.fromMe
          ? sock.user?.id
          : m.key.participant ||
            m.key.remoteJid,

      isGroup:
        m.key.remoteJid?.endsWith(
          '@g.us'
        ),

      mentionedJid:
        contextInfo.mentionedJid || [],

      messageType
    };

  } catch {

    return {};
  }
};

// ========================================
// HANDLE COMMAND
// ========================================

export async function handleCommand(
  sock,
  m
) {

  try {

    if (!m?.body?.trim()) return;

    // ================================
    // Core logic
    // ================================

    await coreLogic({

      sock,

      m,

      body: m.body,

      commands,

      storeMessage,

      saveSettings,

      handleAutoread,

      handleBotModes
    });

  } catch (e) {

    console.error(
      'Erreur handleCommand :',
      e
    );
  }
}

// ========================================
// PARTICIPANT UPDATE
// ========================================

export async function handleParticipantUpdate(
  sock,
  update
) {

  try {

    for (
      const cmd of
      global.participantCommands || []
    ) {

      try {

        await cmd.participantUpdate(
          sock,
          update
        );

      } catch {}
    }

  } catch (e) {

    console.error(
      'Erreur participantUpdate :',
      e
    );
  }
}

// ========================================
// EXPORT DEFAULT
// ========================================

export default handleCommand;