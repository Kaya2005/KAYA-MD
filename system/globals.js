import config from '../config.js';

// 🔹 Owners
global.owner = Array.isArray(config.OWNERS)
  ? config.OWNERS.map(n => n.replace(/\D/g, '') + '@s.whatsapp.net')
  : [];

// 🔹 Sets et états
if (!global.bannedUsers) global.bannedUsers = new Set();
if (global.blockInbox === undefined) global.blockInbox = config.blockInbox ?? false;
if (global.privateMode === undefined) global.privateMode = false;

// 🔹 Modes du bot
if (!global.botModes) global.botModes = {};
if (!global.botModes.autoreact) global.botModes.autoreact = { enabled: false };
if (global.autoStatus === undefined) global.autoStatus = false;
if (global.allPrefix === undefined) global.allPrefix = false;

// 🔹 Groupes
if (!global.antiLinkGroups) global.antiLinkGroups = {};
if (!global.antiSpamGroups) global.antiSpamGroups = {};