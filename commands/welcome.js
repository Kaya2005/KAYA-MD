import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { getContextInfo } from '../system/contextInfo.js';
import checkAdminOrOwner from '../system/checkAdmin.js';
import { buildWelcomeMessage } from '../system/welcomeTemplate.js';
import { BOT_NAME } from '../system/botAssets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WELCOME_FILE = path.join(__dirname, '../data/welcome.json');

// ========================================
// INIT / LOAD / SAVE
// ========================================

const initWelcomeFile = () => {
  if (!fs.existsSync(WELCOME_FILE)) {
    const dir = path.dirname(WELCOME_FILE);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      WELCOME_FILE,
      JSON.stringify({}, null, 2)
    );
  }
};

const loadWelcomeData = () => {
  try {
    initWelcomeFile();
    return JSON.parse(fs.readFileSync(WELCOME_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const saveWelcomeData = data => {
  fs.writeFileSync(WELCOME_FILE, JSON.stringify(data, null, 2));
};

// ========================================
// COMMAND
// ========================================

export default {
  name: 'welcome',
  alias: ['bienvenue', 'wel'],
  description: 'Enable/disable welcome messages',
  category: 'Groupe',
  ownerOnly: true,

  async execute(sock, m, args) {
    try {
      const permissions = await checkAdminOrOwner(sock, m.chat, m.sender);

      if (!permissions.isOwner) {
        return sock.sendMessage(
          m.chat,
          {
            text: '🚫 This command is reserved for the bot owner.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      const welcomeData = loadWelcomeData();
      const chatId = m.chat;

      // ================================
      // MENU
      // ================================
      if (!args.length) {
        return sock.sendMessage(
          chatId,
          {
            text: `
╭━━〔 ${BOT_NAME} 〕━━⬣
│
│ • ${global.PREFIX}welcome on
│ • ${global.PREFIX}welcome off
│ • ${global.PREFIX}welcome all
│ • ${global.PREFIX}welcome all off
│ • ${global.PREFIX}welcome status
╰──────────────────⬣
            `.trim(),
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      const subCmd = args.join(' ').toLowerCase();

      // ================================
      // ALL OFF
      // ================================
      if (subCmd === 'all off') {
        delete welcomeData.global;
        saveWelcomeData(welcomeData);

        return sock.sendMessage(
          chatId,
          {
            text: '❌ Global welcome disabled.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================================
      // ALL ON
      // ================================
      if (subCmd === 'all') {
        welcomeData.global = true;
        saveWelcomeData(welcomeData);

        return sock.sendMessage(
          chatId,
          {
            text: '✅ Global welcome enabled.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================================
      // ON
      // ================================
      if (subCmd === 'on' || subCmd === '1') {
        welcomeData[chatId] = true;
        saveWelcomeData(welcomeData);

        return sock.sendMessage(
          chatId,
          {
            text: '✅ Welcome enabled for this group.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================================
      // OFF
      // ================================
      if (subCmd === 'off' || subCmd === '0') {
        delete welcomeData[chatId];
        saveWelcomeData(welcomeData);

        return sock.sendMessage(
          chatId,
          {
            text: '❌ Welcome disabled for this group.',
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // ================================
      // STATUS
      // ================================
      if (subCmd === 'status') {
        const globalStatus = welcomeData.global
          ? '✅ Enabled globally'
          : '❌ Disabled globally';

        const groupStatus = welcomeData[chatId]
          ? '✅ Enabled here'
          : '❌ Disabled here';

        return sock.sendMessage(
          chatId,
          {
            text: `📊 *WELCOME STATUS*\n\n${globalStatus}\n${groupStatus}`,
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      return sock.sendMessage(
        chatId,
        {
          text: '❌ Unknown command.',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('❌ Welcome error:', err);

      return sock.sendMessage(
        m.chat,
        {
          text: '❌ Error while configuring welcome.',
          contextInfo: getContextInfo()
        },
        { quoted: m }
      );
    }
  },

  // ====================================
  // PARTICIPANT UPDATE
  // ====================================
  async participantUpdate(sock, update) {
    try {
      if (update.action !== 'add') return;

      const welcomeData = loadWelcomeData();
      const chatId = update.id;

      if (!welcomeData.global && !welcomeData[chatId]) return;

      const metadata = await sock.groupMetadata(chatId);

      const now = new Date();
      const date = now.toLocaleDateString('fr-FR');

      const creationDate = metadata.creation
        ? new Date(metadata.creation * 1000).toLocaleDateString('fr-FR')
        : 'Unknown';

      for (const user of update.participants) {
        try {
          const userJid = typeof user === 'string' ? user : user?.id || user?.jid;
          if (!userJid) continue;

          const username = '@' + userJid.split('@')[0];

          let ppUrl;
          try {
            ppUrl = await sock.profilePictureUrl(userJid, 'image');
          } catch {
            ppUrl = 'https://i.ibb.co/7CQVJNm/default-profile.png';
          }

          const { messageText } = buildWelcomeMessage({
            username,
            groupName: metadata.subject || 'Unknown group',
            groupSize: metadata.participants.length,
            creationDate,
            date
          });

          await sock.sendMessage(chatId, {
            image: { url: ppUrl },
            caption: messageText,
            contextInfo: {
              ...getContextInfo(),
              mentionedJid: [userJid]
            }
          });

          await new Promise(res => setTimeout(res, 500));

        } catch (e) {
          console.error('Welcome user error:', e);
        }
      }

    } catch (err) {
      console.error('❌ Welcome participant error:', err);
    }
  }
};