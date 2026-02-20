import { contextInfo } from '../system/contextInfo.js';
import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), 'data', 'autoStatus.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(
    configPath,
    JSON.stringify({ enabled: false, reactOn: false }, null, 2)
  );
}

// Helper functions
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return { enabled: false, reactOn: false };
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}

export default {
  name: 'autostatus',
  description: 'Enable/disable automatic status viewing and reactions',
  category: 'Owner',
  ownerOnly: true,

  run: async (kaya, m, args) => {
    try {
      const action = args[0]?.toLowerCase();
      const config = loadConfig();

      // Show help
      if (!['on', 'off', 'status', 'react'].includes(action)) {
        return kaya.sendMessage(
          m.chat,
          {
            text: `👁️ *Auto Status*

Usage:
.autostatus on
.autostatus off
.autostatus status
.autostatus react on/off

📌 Function:
The bot will automatically view statuses and can react to them and forward them to the owner.`,
            contextInfo
          },
          { quoted: m }
        );
      }

      // Enable AutoStatus
      if (action === 'on') {
        config.enabled = true;
        saveConfig(config);

        // Attach listener once
        if (!global.autoStatusListenerAttached) {
          global.autoStatusListenerAttached = true;
          const ownerJid = kaya.user.id.split(':')[0] + '@s.whatsapp.net';

          kaya.ev.on('stories.update', async (updates) => {
            if (!config.enabled) return;

            for (const update of updates) {
              try {
                const key = update.key;
                const msg = update.message;
                if (!msg) continue;

                const sender = key.participant || key.remoteJid;

                // Mark as seen
                await kaya.sendReadReceipt(key.remoteJid, sender, [key.id]);

                // React if enabled
                if (config.reactOn) {
                  await kaya.relayMessage(
                    'status@broadcast',
                    {
                      reactionMessage: {
                        key: { remoteJid: 'status@broadcast', id: key.id, participant: sender, fromMe: false },
                        text: '💚'
                      }
                    },
                    { messageId: key.id, statusJidList: [sender] }
                  );
                }

                // Forward to owner
                if (msg.imageMessage) {
                  await kaya.sendMessage(ownerJid, {
                    image: { url: msg.imageMessage },
                    caption: `👁️ Status from @${sender.split('@')[0]}`,
                    mentions: [sender]
                  });
                } else if (msg.videoMessage) {
                  await kaya.sendMessage(ownerJid, {
                    video: { url: msg.videoMessage },
                    caption: `👁️ Status from @${sender.split('@')[0]}`,
                    mentions: [sender]
                  });
                } else if (msg.conversation) {
                  await kaya.sendMessage(ownerJid, {
                    text: `👁️ Status from @${sender.split('@')[0]}:\n\n${msg.conversation}`,
                    mentions: [sender]
                  });
                }
              } catch (err) {
                console.error('❌ AutoStatus DM error:', err);
              }
            }
          });
        }

        return kaya.sendMessage(
          m.chat,
          { text: '✅ *Auto Status enabled*', contextInfo },
          { quoted: m }
        );
      }

      // Disable AutoStatus
      if (action === 'off') {
        config.enabled = false;
        saveConfig(config);
        return kaya.sendMessage(
          m.chat,
          { text: '❌ *Auto Status disabled*', contextInfo },
          { quoted: m }
        );
      }

      // Check status
      if (action === 'status') {
        return kaya.sendMessage(
          m.chat,
          {
            text: `👁️ *Auto Status*\nStatus: ${config.enabled ? '✅ ENABLED' : '❌ DISABLED'}\nReactions: ${config.reactOn ? '💚 ENABLED' : '❌ DISABLED'}`,
            contextInfo
          },
          { quoted: m }
        );
      }

      // Toggle reactions
      if (action === 'react') {
        const sub = args[1]?.toLowerCase();
        if (!['on', 'off'].includes(sub)) {
          return kaya.sendMessage(
            m.chat,
            { text: '❌ Usage: .autostatus react on/off', contextInfo },
            { quoted: m }
          );
        }
        config.reactOn = sub === 'on';
        saveConfig(config);
        return kaya.sendMessage(
          m.chat,
          { text: `💫 Status reactions ${config.reactOn ? 'enabled' : 'disabled'}`, contextInfo },
          { quoted: m }
        );
      }
    } catch (err) {
      console.error('❌ autostatus error:', err);
      await kaya.sendMessage(
        m.chat,
        { text: '❌ An error occurred while executing the command.', contextInfo },
        { quoted: m }
      );
    }
  }
};