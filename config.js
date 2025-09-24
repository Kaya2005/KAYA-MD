// ==================== config.js ====================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ----------------------------------------
// 🔹 ESM __dirname polyfill
// ----------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------
// 🔹 Configuration par défaut
// ----------------------------------------
const defaultConfig = {
  SESSION_ID: "SESSION_ID ici",
  OWNER_NUMBER: "243993621718",
  PREFIX: ".",
  TIMEZONE: "Africa/Kinshasa",
  publicBot: true,     // true = public, false = privé par défaut
  autoRead: true,
  restrict: false,
  botImage: "",
  LINKS: {
    group: "https://chat.whatsapp.com/DoMh6jWjly2ErwVppmCGZo",
    channel: "https://whatsapp.com/channel/0029Vb6FFPM002T3SKA6bb2D",
    telegram: "https://t.me/zonetech2"
  }
};

// ----------------------------------------
// 🔹 Chemin vers ./data/config.json
// ----------------------------------------
const dataDir = path.join(__dirname, "data");
const configPath = path.join(dataDir, "config.json");

// Crée le dossier /data si inexistant
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Crée config.json avec la configuration par défaut si inexistant
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
  console.log("✅ config.json créé avec les paramètres par défaut dans /data");
}

// ----------------------------------------
// 🔹 Chargement de la configuration
// ----------------------------------------
let userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// ----------------------------------------
// 🔹 Fonction pour sauvegarder les modifications
// ----------------------------------------
export function saveConfig(updatedConfig) {
  userConfig = { ...userConfig, ...updatedConfig };
  fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2), "utf-8");
  console.log("✅ Configuration sauvegardée avec succès.");
}

// ----------------------------------------
// 🔹 Export de la configuration
// ----------------------------------------
export default userConfig;