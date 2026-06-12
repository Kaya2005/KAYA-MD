// ==================== system/updateChecker.js ====================
import axios from "axios";
import config from "../config.js";

export async function checkUpdate(sock) {
  try {
    // Récupération des infos de version depuis GitHub
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/Kaya2005/KAYA-MD/main/version.json"
    );

    const localVersion = config.VERSION || "0.0.0";
    const remoteVersion = data.version;

    // Si la version distante est différente, notifier l’owner
    if (localVersion !== remoteVersion) {
      const msg = `
🚀 *UPDATE AVAILABLE*
━━━━━━━━━━━━━━━━━━
📦 Current version: ${localVersion}
🆕 New version: ${remoteVersion}

📝 ${data.message || "No details provided"}

👉 Type *.update* to upgrade
`;

      if (sock.user?.id) {
        await sock.sendMessage(sock.user.id, { text: msg });
      } else {
        console.log("⚠️ Unable to send update message: bot ID not found.");
      }
    } else {
      console.log(`✅ Bot is up-to-date (v${localVersion})`);
    }

  } catch (err) {
    console.log("⚠️ Unable to check for updates:", err.message);
  }
}