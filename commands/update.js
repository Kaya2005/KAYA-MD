import { execSync } from "child_process";
import { getContextInfo } from "../system/contextInfo.js";

const REPO_DIR = process.cwd();

/* ================= GIT ================= */
function getLocalCommit() {
  try {
    return execSync(`git -C ${REPO_DIR} rev-parse HEAD`).toString().trim();
  } catch {
    return null;
  }
}

function getRemoteCommit() {
  try {
    return execSync(
      `git ls-remote https://github.com/Kaya2005/KAYA-MD.git HEAD`
    )
      .toString()
      .split("\t")[0];
  } catch {
    return null;
  }
}

/* ================= BAR ================= */
function bar(p) {
  const total = 10;
  const filled = Math.round((p / 100) * total);
  return "▰".repeat(filled) + "▱".repeat(total - filled) + ` ${p}%`;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ================= UPDATE ================= */
export default {
  name: "update",
  description: "Live update bot",
  category: "System",

  async execute(Kaya, m, args) {
    try {

      if (!m.fromMe) {
        return Kaya.sendMessage(m.chat, {
          text: "❌ Owner only",
          contextInfo: getContextInfo()
        }, { quoted: m });
      }

      // 🔥 1. send initial message
      let msg = await Kaya.sendMessage(m.chat, {
        text: `🔄 Update en cours...\n${bar(5)}`,
        contextInfo: getContextInfo()
      }, { quoted: m });

      const edit = async (text) => {
        await Kaya.sendMessage(m.chat, {
          text,
          edit: msg.key
        });
      };

      const local = getLocalCommit();
      const remote = getRemoteCommit();

      if (local === remote) {
        return edit(`📦 Déjà à jour\n${bar(100)}`);
      }

      await sleep(500);
      await edit(`🔍 Vérification...\n${bar(15)}`);

      await sleep(600);
      await edit(`⬇️ Téléchargement...\n${bar(40)}`);

      execSync(`git -C ${REPO_DIR} reset --hard`, { stdio: "inherit" });
      execSync(`git -C ${REPO_DIR} pull`, { stdio: "inherit" });

      await sleep(600);
      await edit(`⚙️ Installation...\n${bar(75)}`);

      await sleep(600);
      await edit(`🚀 Finalisation...\n${bar(95)}`);

      await sleep(600);
      await edit(`✅ Update terminé\n${bar(100)}\n♻️ Redémarrage...`);

      process.exit(0);

    } catch (e) {
      console.error(e);

      try {
        await Kaya.sendMessage(m.chat, {
          text: "❌ Update failed",
          contextInfo: getContextInfo()
        }, { quoted: m });
      } catch {}
    }
  }
};