import fs from "fs";

const configPath = "./data/config.json";

if (!fs.existsSync(configPath)) {
  throw new Error("config.json introuvable");
}

/* ================= LOAD CONFIG ================= */
let userConfig = JSON.parse(
  fs.readFileSync(configPath, "utf-8")
);

/* ================= NORMALISATION ================= */
global.SESSION_ID = userConfig.SESSION_ID;
global.owner = userConfig.OWNERS || [];
global.PREFIX = userConfig.PREFIX;

/* ================= SAVE CONFIG ================= */
export function saveConfig(updatedConfig = {}) {
  try {
    userConfig = {
      ...userConfig,
      ...updatedConfig
    };

    fs.writeFileSync(
      configPath,
      JSON.stringify(userConfig, null, 2)
    );

    // Synchronisation des variables globales
    if (updatedConfig.SESSION_ID !== undefined) {
      global.SESSION_ID = updatedConfig.SESSION_ID;
    }

    if (updatedConfig.OWNERS !== undefined) {
      global.owner = updatedConfig.OWNERS;
    }

    if (updatedConfig.PREFIX !== undefined) {
      global.PREFIX = updatedConfig.PREFIX;
    }

    console.log("✅ Configuration sauvegardée.");
  } catch (err) {
    console.error("❌ Erreur saveConfig :", err);
  }
}

/* ================= EXPORT ================= */
export default userConfig;