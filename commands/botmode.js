// ==================== commands/mode.js ====================
import fs from 'fs';
import path from 'path';
import { contextInfo } from '../system/contextInfo.js';

const dataDir = path.join(process.cwd(), 'data');
const file = path.join(dataDir, 'mode.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Load
if (global.privateMode === undefined) {
  if (fs.existsSync(file)) {
    try {
      global.privateMode = JSON.parse(fs.readFileSync(file)).private;
    } catch {
      global.privateMode = false;
    }
  } else {
    global.privateMode = false;
  }
}

export default {
  name: "mode",
  description: "Change bot mode (public/private)",
  category: "Owner",
  ownerOnly: true,

  run: async (sock, m, args) => {
    try {
      const action = args[0]?.toLowerCase();

      if (!action || !["public", "private"].includes(action)) {
        return sock.sendMessage(
          m.chat,
          {
            text: `⚙️ Usage:
.mode public
.mode private`,
            contextInfo
          },
          { quoted: m }
        );
      }

      // 🔥 Update instantly
      global.privateMode = action === "private";

      // 💾 Save
      fs.writeFileSync(file, JSON.stringify({ private: global.privateMode }));

      return sock.sendMessage(
        m.chat,
        {
          text: global.privateMode
            ? "🔒 Bot is now in *PRIVATE MODE*"
            : "🌍 Bot is now in *PUBLIC MODE*",
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ mode error:", err);
      sock.sendMessage(
        m.chat,
        { text: "❌ Error changing mode.", contextInfo },
        { quoted: m }
      );
    }
  }
};