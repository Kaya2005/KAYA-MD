// handlers/mentionHandler.js
import fs from "fs";
import path from "path";

export function loadMentionState() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "mention.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return { enabled: false, type: "text", assetPath: "" };
  }
}

export async function handleMention(sock, m) {
  try {
    const state = loadMentionState();
    if (!state.enabled) return;

    const mentioned = m.mentionedJid || [];
    if (!mentioned.includes(sock.user.id)) return;

    const assetPath = state.assetPath ? path.join(process.cwd(), state.assetPath) : null;
    if (!assetPath || !fs.existsSync(assetPath)) return;

    if (state.type === "text") {
      const text = fs.readFileSync(assetPath, "utf8");
      await sock.sendMessage(m.chat, { text }, { quoted: m });
    } else if (state.type === "sticker") {
      const buffer = fs.readFileSync(assetPath);
      await sock.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
    } else if (state.type === "image") {
      const buffer = fs.readFileSync(assetPath);
      await sock.sendMessage(m.chat, { image: buffer }, { quoted: m });
    } else if (state.type === "video") {
      const buffer = fs.readFileSync(assetPath);
      await sock.sendMessage(m.chat, { video: buffer, gifPlayback: state.gifPlayback || false }, { quoted: m });
    } else if (state.type === "audio") {
      const buffer = fs.readFileSync(assetPath);
      await sock.sendMessage(m.chat, { audio: buffer, ptt: state.ptt || false }, { quoted: m });
    } else if (state.type === "file") {
      const buffer = fs.readFileSync(assetPath);
      await sock.sendMessage(m.chat, { document: buffer, fileName: path.basename(assetPath) }, { quoted: m });
    }
  } catch (err) {
    console.error("❌ handleMention error:", err);
  }
}