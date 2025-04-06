import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';

// Get total memory and free memory in bytes
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();

// Define unit conversions
const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

// Function to format bytes to a human-readable format
function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) {
    return (bytes * byteToGB).toFixed(2) + ' GB';
  } else if (bytes >= Math.pow(1024, 2)) {
    return (bytes * byteToMB).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes * byteToKB).toFixed(2) + ' KB';
  } else {
    return bytes.toFixed(2) + ' bytes';
  }
}

// Bot Process Time
const uptime = process.uptime();
const day = Math.floor(uptime / (24 * 3600)); // Calculate days
const hours = Math.floor((uptime % (24 * 3600)) / 3600); // Calculate hours
const minutes = Math.floor((uptime % 3600) / 60); // Calculate minutes
const seconds = Math.floor(uptime % 60); // Calculate seconds

// Uptime
const uptimeMessage = `*I am alive now since ${day}d ${hours}h ${minutes}m ${seconds}s*`;
const runMessage = `*☀️ ${day} Day*\n*🕐 ${hours} Hour*\n*⏰ ${minutes} Minutes*\n*⏱️ ${seconds} Seconds*\n`;

const xtime = moment.tz("Africa/Zimbabwe").format("HH:mm:ss");
const xdate = moment.tz("Africa/Zimbabwe").format("DD/MM/YYYY");
const time2 = moment().tz("Africa/Zimbabwe").format("HH:mm:ss");
let pushwish = "";

if (time2 < "05:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "11:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "15:00:00") {
  pushwish = `Good Afternoon 🌅`;
} else if (time2 < "18:00:00") {
  pushwish = `Good Evening 🌃`;
} else if (time2 < "19:00:00") {
  pushwish = `Good Evening 🌃`;
} else {
  pushwish = `Good Night 🌌`;
}

const test = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const mode = config.MODE === 'public' ? 'public' : 'private';
  const pref = config.PREFIX;

  const validCommands = ['list', 'help', 'menu'];

  if (validCommands.includes(cmd)) {
    const str = `
*╭──────────────*
*┊* ❒ ʙᴏᴛɴᴀᴍᴇ : *ᴛᴏɴɪᴄ-ᴍᴅ*
*┊* ❒ ᴏᴡɴᴇʀ : *ᴛᴏɴɪᴄ ᴍᴜɴᴏᴅᴀᴡᴀғᴀ*
*┊* ❒ ᴜsᴇʀ : *${m.pushName}*
*┊* ❒ ᴍᴏᴅᴇ : *${mode}*
*┊* ❒ ᴘʟᴀᴛғᴏʀᴍ : *${os.platform()}*
*┊* ❒ ᴘʀᴇғɪx : [${prefix}]
*┊* ❒ ᴠᴇʀsɪᴏɴ : *1.0.0*
*╰──────────────*

> Hey ${m.pushName} ${pushwish}


『*\`AI 𝐌𝐄𝐍𝐔\`*』
╭─────────────
│◈ *.ᴀɪ* 
│◈ *.ɢᴘᴛ*
│◈ *.ᴛᴏɴɪᴄ*
│◈ *.ɢᴇᴍɪɴɪ*
│◈ *.ɢᴘᴛ3*
╰━━━━━━━━━━━━━━━━

  『*\`𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔\`*』
╭───────────────
│◈ *.ᴏᴡɴᴇʀ*
│◈ *.ʀᴇᴘᴏ*
│◈ *.ᴄᴏᴜɴᴛᴅᴏᴡɴ*
│◈ *.ʀᴇᴘᴏʀᴛʙᴜɢ*
│◈ *.ʙʟᴏᴄᴋʟɪsᴛ*
│◈ *.ᴀᴜᴛᴏʀᴇᴘʟʏ*
│◈ *.sᴛᴀᴛᴜs*
│◈ *.ᴠᴇʀsɪᴏɴ*
│◈ *.ʙʟᴏᴄᴋ*
│◈ *.ᴜɴʙʟᴏᴄᴋ*
│◈ *.ᴄʟᴇᴀʀᴄʜᴀᴛs*
│◈ *.sᴇᴛᴘᴘ*
│◈ *.ʙʀᴏᴀᴅᴄᴀsᴛ*
│◈ *.ᴘɪɴɢ*
│◈ *.ᴘɪɴɢ2*
│◈ *.ᴊɪᴅ*
│◈ *.ɢᴊɪᴅ*
│◈ *.ᴊɪᴅ2*
│◈ *.ʀᴇꜱᴛᴀʀᴛ*
│◈ *.ᴜᴘᴅᴀᴛᴇ*
╰━━━━━━━━━━━━━━━━

『*\`GROUP 𝐌𝐄𝐍𝐔\`*』
╭────────────
│◈ *.ᴘʀᴏᴍᴏᴛᴇ* 
│◈ *.ᴅᴇᴍᴏᴛᴇ* 
│◈ *.ᴅᴇʟᴇᴛᴇ*
│◈ *.ᴋɪᴄᴋ* 
│◈ *.ᴋɪᴄᴋᴀʟʟ*
│◈ *.ᴀᴅᴅ* 
│◈ *.ᴀᴅᴍɪɴs* 
│◈ *.ɢᴇᴛᴘɪᴄ* 
│◈ *.sᴇᴛᴡᴇʟᴄᴏᴍᴇ* 
│◈ *.sᴇᴛɢᴏᴏᴅʙʏᴇ* 
│◈ *.ᴘᴏʟʟ*
│◈ *.ɢᴄɴᴀᴍᴇ* 
│◈ *.ᴛᴀɢᴀʟʟ* 
│◈ *.ᴛᴀɢᴀᴅᴍɪɴ* 
│◈ *.ᴏᴘᴇɴᴛɪᴍᴇ*
│◈ *.ᴄʟᴏsᴇᴛɪᴍᴇ* 
│◈ *.ɢᴄɪɴғᴏ* 
│◈ *.ɢᴄʟɪɴᴋ*
│◈ *.ᴜɴʟᴏᴄᴋ*
│◈ *.ʟᴏᴄᴋ*
│◈ *.ᴍᴜᴛᴇ*
│◈ *.ᴜɴᴍᴜᴛᴇ*
│◈ *.ɢᴄᴅᴇsᴄ*
│◈ *.sᴇᴛsᴜʙᴊᴇᴄᴛ*
╰━━━━━━━━━━━━━━━━

『*\`DOWNLOAD 𝐌𝐄𝐍𝐔\`*』
╭────────────────
│◈ *.ᴀᴘᴋ* 
│◈ *.ᴛɪᴋᴛᴏᴋ*
│◈ *.ᴛᴡɪᴛᴛᴇʀ*
│◈ *.ᴍᴇᴅɪᴀғɪʀᴇ* 
│◈ *.sᴘᴏᴛɪғʏ*
│◈ *.ғᴀᴄᴇʙᴏᴏᴋ*
│◈ *.ɪɴsᴛᴀ* 
│◈ *.sᴏɴɢ* 
│◈ *.ᴠɪᴅᴇᴏ*
│◈ *.ᴘʟᴀʏ*
│◈ *.ʏᴛ*
│◈ *.ʏᴛᴍᴘ3*
│◈ *.ʏᴛᴍᴘ4*
│◈ *.ᴛɪᴋᴛᴏᴋ* 
│◈ *.sʀᴇᴘᴏ*
╰━━━━━━━━━━━━━━━━

  『*\`SETTINGS 𝐌𝐄𝐍𝐔\`*』
╭─────────────
│◈ *.ᴇɴᴠ* 
│◈ *.ᴀᴜᴛᴏsᴠɪᴇᴡ* 
│◈ *.ᴀᴜᴛᴏʀᴇᴀᴄᴛ*
│◈ *.ᴀᴜᴛᴏʀᴇᴀᴅ*
╰━━━━━━━━━━━━━━━━


  『*\`SEARCH 𝐌𝐄𝐍𝐔\`*』
╭────────── ────
│◈ *.ᴍᴏᴠɪᴇ <ᴛᴇxᴛ>*
│◈ *.ɪᴍɢ <ᴛᴇxᴛ>*
│◈ *.ᴡᴇᴀᴛʜᴇʀ <ᴄɪᴛʏ>*
│◈ *.ʟʏʀɪᴄs*
│◈ *.ɢᴏᴏɢʟᴇ*
│◈ *.ʏᴛs*
│◈ *.ɪᴍᴅʙ*
╰━━━━━━━━━━━━━━━━

  『*\`GENERAL 𝐌𝐄𝐍𝐔\`*』
╭─────────────
│◈ *.ᴀʟɪᴠᴇ*   
│◈ *.ᴅᴇᴠ*
│◈ *.ɢᴇᴛᴘᴘ* 
│◈ *.ʜᴇʟᴘ* 
│◈ *.ᴍᴇɴᴜ* 
│◈ *.ᴏᴡɴᴇʀ* 
│◈ *.ᴘɪɴɢ*
│◈ *.ʀᴇᴘᴏ*
│◈ *.ʀᴜɴᴛɪᴍᴇ*
│◈ *.sʏsᴛᴇᴍɪɴғᴏ*
│◈ *.ϙʀᴄᴏᴅᴇ*
│◈ *.ᴛɪᴍᴇ*
│◈ *.ᴀʙᴏᴜᴛ*
│◈ *.ᴅᴀᴛᴇ*
╰━━━━━━━━━━━━━━━━

  『*\`FUN 𝐌𝐄𝐍𝐔\`*』
╭────────────
│◈ *.ғᴀᴄᴛ* 
│◈ *.ᴛʀᴜᴛʜ/ᴅᴀʀᴇ*
│◈ *.ʟᴏɢᴏ*
│◈ *.ғᴀɴᴄʏ*
│◈ *.ʜᴀᴄᴋ*  
│◈ *.ʟᴏʟɪ* 
│◈ *.ᴡᴀɪғᴜ*
│◈ *.ɴᴇᴋᴏ*
│◈ *.ᴍᴇɢᴜᴍɪɴ*
│◈ *.ᴀᴡᴏᴏ*
│◈ *.ᴡᴀʟʟᴘᴀᴘᴇʀ*
│◈ *.ᴄᴏᴜɴᴛᴅᴏᴡɴ*
│◈ *.ᴄᴀʟᴄᴜʟᴀᴛᴇ*
│◈ *.ᴋɪss*
│◈ *.ʜᴀɴᴀ*
│◈ *.ʜᴀᴘᴘʏ*
│◈ *.ʜᴇᴀʀᴛ*
│◈ *.ᴀɴɢᴇʀ*
│◈ *.sᴀᴅ*
│◈ *.sʜʏ*
│◈ *.ᴍᴏᴏᴅ*
│◈ *.ᴄᴏɴғᴜsᴇᴅ*
│◈ *.ɴɪᴋᴀʟ*
╰━━━━━━━━━━━━━━━━

 『*\`𝖱𝖤𝖫𝖨𝖦𝖨𝖮𝖭 𝐌𝐄𝐍𝐔\`*』
╭────────────
│◈ *.ʙɪʙʟᴇ*
╰━━━━━━━━━━━━━━━━

  『*\`TOOLS 𝐌𝐄𝐍𝐔\`*』
╭────────────
│◈ *.ǫʀᴄᴏᴅᴇ*
│◈ *.ɢɪᴛᴄʟᴏɴᴇ*
│◈ *.ᴇɴʜᴀɴᴄᴇ*
│◈ *.sᴀᴠᴇ*
│◈ *.ssᴡᴇʙ*
│◈ *.ᴛɪɴʏᴜʀʟ*
│◈ *.sᴛɪᴄᴋᴇʀ*
│◈ *.ᴛᴀᴋᴇ*
│◈ *.ᴛᴛs*
│◈ *.ᴜʀʟ*
│◈ *.ᴄᴏɴᴠᴇʀᴛ*
│◈ *.ᴛʀᴀɴsʟᴀᴛᴇ*
│◈ *.ᴠᴠ*
│◈ *.ᴏʙsғᴜsᴄᴀᴛᴇ*
╰━━━━━━━━━━━━━━━━`

    await Matrix.sendMessage(m.from, {
      image: fs.readFileSync('./media/tonic.jpg'),
      caption: str,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363374632065395@newsletter',
          newsletterName: "Tᴏɴɪᴄ Tᴇᴄʜ Iɴᴄ.",
          serverMessageId: 143
        }
      }
    }, {
      quoted: m
    });

    // Send audio after sending the menu
    await Matrix.sendMessage(m.from, {
      audio: { url: null },
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: m });
  }
};

export default test;
