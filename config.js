import fs from "fs";

const configPath = "./data/config.json";

if (!fs.existsSync(configPath)) {
  throw new Error("config.json introuvable");
}

const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

/* ================= NORMALISATION ================= */
global.SESSION_ID = userConfig.SESSION_ID;
global.owner = userConfig.OWNERS || [];
global.prefix = userConfig.PREFIX;

/* ================= EXPORT ================= */
export default userConfig;