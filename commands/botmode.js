import { contextInfo } from "../system/contextInfo.js";
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const privateFile = path.join(dataDir, 'privateMode.json');

// Crée le dossier si nécessaire
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Charger la valeur persistante au démarrage
if (global.privateMode === undefined) {
  if (fs.existsSync(privateFile)) {
    try {
      global.privateMode = JSON.parse(fs.readFileSync(privateFile, 'utf-8')).private;
    } catch {
      global.privateMode = false;
    }
  } else {
    global.privateMode = false;
  }
}

export default {
  name: "private",
  description: "🔒 Enable or disable bot private mode (owner only)",
  category: "Owner",
  ownerOnly: true, // ✅ Managed by handler

  run: async (sock, m, args) => {
    try {
      const action = args[0]?.toLowerCase();
      if (!action || !["on", "off"].includes(action)) {
        return sock.sendMessage(
          m.chat,
          { text: "🔒 Usage:\n.private on\n.private off", contextInfo },
          { quoted: m }
        );
      }

      // Définir la valeur globale
      global.privateMode = action === "on";

      // Sauvegarder dans le fichier JSON pour persistance
      fs.writeFileSync(privateFile, JSON.stringify({ private: global.privateMode }));

      return sock.sendMessage(
        m.chat,
        {
          text: global.privateMode
            ? "✅ *Private mode enabled*: only owner commands are accepted."
            : "❌ *Private mode disabled*: everyone can use commands.",
          contextInfo
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ private.js error:", err);
      return sock.sendMessage(
        m.chat,
        { text: "❌ An error occurred while toggling private mode.", contextInfo },
        { quoted: m }
      );
    }
  }
};