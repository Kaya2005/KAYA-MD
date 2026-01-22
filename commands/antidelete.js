// ==================== commands/antidelete.js ====================
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";

const messageStore = new Map();
const CONFIG_PATH = path.join(process.cwd(), "data/antidelete.json");
const TEMP_MEDIA_DIR = path.join(process.cwd(), "tmp");

// Ensure tmp exists
if (!fs.existsSync(TEMP_MEDIA_DIR)) fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });

// 🔹 Folder size check
const getFolderSizeMB = folder => {
  try {
    return fs.readdirSync(folder).reduce((acc, f) => {
      const fp = path.join(folder, f);
      if (fs.statSync(fp).isFile()) acc += fs.statSync(fp).size;
      return acc;
    }, 0) / (1024 * 1024);
  } catch { return 0; }
};

// 🔹 Auto cleanup > 200MB
setInterval(() => {
  try {
    if (getFolderSizeMB(TEMP_MEDIA_DIR) > 200) {
      fs.readdirSync(TEMP_MEDIA_DIR).forEach(f => fs.unlinkSync(path.join(TEMP_MEDIA_DIR, f)));
    }
  } catch (err) { console.error("Temp cleanup error:", err); }
}, 60000);

// 🔹 Load/Save config
const loadConfig = () => {
  if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH)); } catch { return { enabled: false }; }
};
const saveConfig = config => fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

// 🔹 Command Handler
export default {
  name: "antidelete",
  description: "🛡️ Toggle anti-delete messages",
  category: "Owner",
  ownerOnly: true,
  run: async (sock, m, args) => {
    const action = args[0]?.toLowerCase();
    const config = loadConfig();

    if (!action || !["on", "off"].includes(action)) {
      return sock.sendMessage(
        m.chat,
        {
          text: `*ANTIDELETE STATUS*\nCurrent: ${config.enabled ? "✅ Enabled" : "❌ Disabled"}\n\nUsage:\n.antidelete on\n.antidelete off`
        },
        { quoted: m }
      );
    }

    config.enabled = action === "on";
    saveConfig(config);

    return sock.sendMessage(
      m.chat,
      { text: `*Antidelete ${config.enabled ? "Enabled ✅" : "Disabled ❌"}*` },
      { quoted: m }
    );
  }
};

// 🔹 Store messages
export async function storeMessage(sock, message) {
  try {
    const config = loadConfig();
    if (!config.enabled) return;
    if (!message.key?.id) return;

    const messageId = message.key.id;
    let content = "", mediaType = "", mediaPath = "";
    const sender = message.key.participant || message.key.remoteJid;
    let isViewOnce = false;

    const viewOnce = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;

    if (viewOnce) {
      if (viewOnce.imageMessage) {
        mediaType = "image";
        content = viewOnce.imageMessage.caption || "";
        const buffer = await downloadContentFromMessage(viewOnce.imageMessage, "image");
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
        await writeFile(mediaPath, buffer);
        isViewOnce = true;
      } else if (viewOnce.videoMessage) {
        mediaType = "video";
        content = viewOnce.videoMessage.caption || "";
        const buffer = await downloadContentFromMessage(viewOnce.videoMessage, "video");
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
        await writeFile(mediaPath, buffer);
        isViewOnce = true;
      }
    } else if (message.message?.conversation) {
      content = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      content = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage) {
      mediaType = "image";
      content = message.message.imageMessage.caption || "";
      const buffer = await downloadContentFromMessage(message.message.imageMessage, "image");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.stickerMessage) {
      mediaType = "sticker";
      const buffer = await downloadContentFromMessage(message.message.stickerMessage, "sticker");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.videoMessage) {
      mediaType = "video";
      content = message.message.videoMessage.caption || "";
      const buffer = await downloadContentFromMessage(message.message.videoMessage, "video");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.audioMessage) {
      mediaType = "audio";
      const mime = message.message.audioMessage.mimetype || "";
      const ext = mime.includes("mpeg") ? "mp3" : mime.includes("ogg") ? "ogg" : "mp3";
      const buffer = await downloadContentFromMessage(message.message.audioMessage, "audio");
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
      await writeFile(mediaPath, buffer);
    }

    messageStore.set(messageId, {
      content,
      mediaType,
      mediaPath,
      sender,
      group: message.key.remoteJid.endsWith("@g.us") ? message.key.remoteJid : null,
      timestamp: new Date().toISOString()
    });

    // Forward view-once immediately
    if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
      try {
        const owner = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const senderName = sender.split("@")[0];
        const mediaOpts = { caption: `*Anti-ViewOnce ${mediaType}*\nFrom: @${senderName}`, mentions: [sender] };
        if (mediaType === "image") await sock.sendMessage(owner, { image: { url: mediaPath }, ...mediaOpts });
        if (mediaType === "video") await sock.sendMessage(owner, { video: { url: mediaPath }, ...mediaOpts });
        try { fs.unlinkSync(mediaPath); } catch {}
      } catch {}
    }

  } catch (err) { console.error("storeMessage error:", err); }
}

// 🔹 Handle deleted messages
export async function handleMessageRevocation(sock, revMessage) {
  try {
    const config = loadConfig();
    if (!config.enabled) return;

    const messageId = revMessage.message.protocolMessage.key.id;
    const deletedBy = revMessage.participant || revMessage.key.participant || revMessage.key.remoteJid;
    const owner = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    if (deletedBy.includes(sock.user.id) || deletedBy === owner) return;

    const original = messageStore.get(messageId);
    if (!original) return;

    const senderName = original.sender.split("@")[0];
    const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : "";

    let text = `*🔰 ANTIDELETE REPORT 🔰*\n\n*🗑️ Deleted By:* @${deletedBy.split("@")[0]}\n*👤 Sender:* @${senderName}\n*📱 Number:* ${original.sender}\n`;
    if (groupName) text += `*👥 Group:* ${groupName}\n`;
    if (original.content) text += `\n*💬 Deleted Message:*\n${original.content}`;

    await sock.sendMessage(owner, { text, mentions: [deletedBy, original.sender] });

    if (original.mediaType && fs.existsSync(original.mediaPath)) {
      const opts = { caption: `*Deleted ${original.mediaType}*\nFrom: @${senderName}`, mentions: [original.sender] };
      try {
        switch (original.mediaType) {
          case "image": await sock.sendMessage(owner, { image: { url: original.mediaPath }, ...opts }); break;
          case "sticker": await sock.sendMessage(owner, { sticker: { url: original.mediaPath }, ...opts }); break;
          case "video": await sock.sendMessage(owner, { video: { url: original.mediaPath }, ...opts }); break;
          case "audio": await sock.sendMessage(owner, { audio: { url: original.mediaPath }, mimetype: "audio/mpeg", ptt: false, ...opts }); break;
        }
      } catch (err) { await sock.sendMessage(owner, { text: `⚠️ Error sending media: ${err.message}` }); }
      try { fs.unlinkSync(original.mediaPath); } catch {}
    }

    messageStore.delete(messageId);

  } catch (err) { console.error("handleMessageRevocation error:", err); }
}