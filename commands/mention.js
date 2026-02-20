import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

// ----------------- Load & Save -----------------
function loadState() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "mention.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return { enabled: false, type: "text", assetPath: "" };
  }
}

function saveState(state) {
  fs.writeFileSync(path.join(process.cwd(), "data", "mention.json"), JSON.stringify(state, null, 2));
}

// ----------------- Module -----------------
export default {
  name: "mention",
  description: "Enable/Disable automatic replies to mentions and customize the message.",
  category: "Owner",
  owner: true,
  usage: ".mention on|off / .setmention (reply to message or media)",

  async execute(kaya, m, args) {
    try {
      const chatId = m.chat;
      const subCommand = args[0]?.toLowerCase();

      // ------------------ TOGGLE ON/OFF ------------------
      if (subCommand === "on" || subCommand === "off") {
        if (!m.fromMe && !m.isOwner)
          return kaya.sendMessage(chatId, { text: "🚫 Only owners can enable/disable this." }, { quoted: m });

        const state = loadState();
        state.enabled = subCommand === "on";
        saveState(state);

        return kaya.sendMessage(chatId, { text: `✅ Mention reply ${state.enabled ? "enabled" : "disabled"}.` }, { quoted: m });
      }

      // ------------------ SET MESSAGE / MEDIA ------------------
      if (subCommand === "setmention") {
        if (!m.fromMe && !m.isOwner)
          return kaya.sendMessage(chatId, { text: "🚫 Only owners can set the mention message." }, { quoted: m });

        const ctx = m.message?.extendedTextMessage?.contextInfo;
        const qMsg = ctx?.quotedMessage;
        if (!qMsg) return kaya.sendMessage(chatId, { text: "⚠️ Reply to a message or media to set the mention." }, { quoted: m });

        let type = "sticker", buf, dataType;

        if (qMsg.stickerMessage) { dataType = "stickerMessage"; type = "sticker"; }
        else if (qMsg.imageMessage) { dataType = "imageMessage"; type = "image"; }
        else if (qMsg.videoMessage) { dataType = "videoMessage"; type = "video"; }
        else if (qMsg.audioMessage) { dataType = "audioMessage"; type = "audio"; }
        else if (qMsg.documentMessage) { dataType = "documentMessage"; type = "file"; }
        else if (qMsg.conversation || qMsg.extendedTextMessage?.text) type = "text";
        else return kaya.sendMessage(chatId, { text: "⚠️ Unsupported type." }, { quoted: m });

        if (type === "text") buf = Buffer.from(qMsg.conversation || qMsg.extendedTextMessage?.text || "", "utf8");
        else {
          const stream = await downloadContentFromMessage(qMsg[dataType], type === "sticker" ? "sticker" : type);
          const chunks = [];
          for await (const chunk of stream) chunks.push(chunk);
          buf = Buffer.concat(chunks);
        }

        if (buf.length > 1024 * 1024) return kaya.sendMessage(chatId, { text: "⚠️ File too large. Max 1MB." }, { quoted: m });

        const assetsDir = path.join(process.cwd(), "assets");
        if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

        // Remove old files
        fs.readdirSync(assetsDir).forEach(f => { if (f.startsWith("mention_custom.")) fs.unlinkSync(path.join(assetsDir, f)); });

        const extMap = { sticker: "webp", image: "jpg", video: "mp4", audio: "mp3", file: "bin", text: "txt" };
        const outName = `mention_custom.${extMap[type] || "bin"}`;
        const outPath = path.join(assetsDir, outName);
        fs.writeFileSync(outPath, buf);

        const state = loadState();
        state.assetPath = path.join("assets", outName);
        state.type = type;
        saveState(state);

        return kaya.sendMessage(chatId, { text: "✅ Mention reply updated." }, { quoted: m });
      }

      // ------------------ HELP ------------------
      return kaya.sendMessage(chatId, { text: "⚙️ Usage:\n.mention on|off\n.setmention (reply to a message or media)" }, { quoted: m });

    } catch (err) {
      console.error("❌ mention command error:", err);
      return kaya.sendMessage(m.chat, { text: "⚠️ An error occurred." }, { quoted: m });
    }
  },

  // ------------------ DETECT MENTION ------------------
  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const state = loadState();
      if (!state.enabled) return;

      const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentions.includes(kaya.user.jid)) return;

      // Reply with the stored asset
      const assetPath = state.assetPath;
      if (!assetPath || !fs.existsSync(assetPath)) return;

      if (state.type === "text") {
        const text = fs.readFileSync(assetPath, "utf8");
        await kaya.sendMessage(m.chat, { text }, { quoted: m });
      } else if (state.type === "sticker") {
        const buffer = fs.readFileSync(assetPath);
        await kaya.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
      } else if (state.type === "image") {
        const buffer = fs.readFileSync(assetPath);
        await kaya.sendMessage(m.chat, { image: buffer }, { quoted: m });
      } else if (state.type === "video") {
        const buffer = fs.readFileSync(assetPath);
        await kaya.sendMessage(m.chat, { video: buffer }, { quoted: m });
      } else if (state.type === "audio") {
        const buffer = fs.readFileSync(assetPath);
        await kaya.sendMessage(m.chat, { audio: buffer }, { quoted: m });
      } else if (state.type === "file") {
        const buffer = fs.readFileSync(assetPath);
        await kaya.sendMessage(m.chat, { document: buffer, fileName: path.basename(assetPath) }, { quoted: m });
      }

    } catch (err) {
      console.error("❌ mention detect error:", err);
    }
  }
};