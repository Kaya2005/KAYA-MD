import { execSync } from "child_process";
import { getContextInfo } from "../system/contextInfo.js";

const REPO_DIR = process.cwd();

/* ================= GIT ================= */
function getLocalCommit() {
  try {
    return execSync(
      `git -C ${REPO_DIR} log -1 --pretty=format:"%h|%s|%cr"`
    )
      .toString()
      .trim();
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

function getChangedFiles() {
  try {
    return execSync(
      `git -C ${REPO_DIR} diff --name-only HEAD@{1} HEAD`
    )
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

/* ================= PROGRESS BAR ================= */
function bar(p) {
  const total = 10;
  const filled = Math.round((p / 100) * total);
  return "▰".repeat(filled) + "▱".repeat(total - filled) + ` ${p}%`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================= UPDATE COMMAND ================= */
export default {
  name: "update",
  description: "Live bot update with details",
  category: "System",
  ownerOnly: true,

  async execute(Kaya, m) {
    try {
      /* ================= OWNER CHECK ================= */
      if (!m.fromMe) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: "❌ Owner only",
            contextInfo: getContextInfo(),
          },
          { quoted: m }
        );
      }

      const localBefore = getLocalCommit();

      /* ================= INIT MESSAGE ================= */
      let msg = await Kaya.sendMessage(
        m.chat,
        {
          text: `🔄 Mise à jour en cours...\n${bar(5)}`,
          contextInfo: getContextInfo(),
        },
        { quoted: m }
      );

      const edit = async (text) => {
        await Kaya.sendMessage(m.chat, {
          text,
          edit: msg.key,
        });
      };

      /* ================= CHECK ================= */
      await sleep(400);
      await edit(`🔍 Vérification updates...\n${bar(20)}`);

      execSync(`git -C ${REPO_DIR} fetch`, { stdio: "ignore" });

      const remote = getRemoteCommit();

      if (!remote) {
        return edit("❌ Impossible de vérifier les updates");
      }

      await sleep(400);
      await edit(`⬇️ Téléchargement...\n${bar(40)}`);

      /* ================= UPDATE ================= */
      execSync(`git -C ${REPO_DIR} reset --hard`, {
        stdio: "inherit",
      });

      execSync(`git -C ${REPO_DIR} pull`, {
        stdio: "inherit",
      });

      /* ================= ANALYSE ================= */
      await sleep(400);
      await edit(`⚙️ Analyse des changements...\n${bar(70)}`);

      const changed = getChangedFiles();
      const localAfter = getLocalCommit();

      /* ================= RESULT ================= */
      await sleep(400);
      await edit(
        `🚀 UPDATE TERMINÉ\n${bar(100)}\n\n` +
          `📌 Commit actuel:\n${localAfter || "N/A"}\n\n` +
          `📂 Fichiers modifiés: ${changed.length}\n` +
          changed
            .slice(0, 8)
            .map((f) => `• ${f}`)
            .join("\n") +
          `\n\n♻️ Redémarrage du bot...`
      );

      /* ================= RESTART ================= */
      setTimeout(() => {
        process.exit(0);
      }, 1500);
    } catch (e) {
      console.error("UPDATE ERROR:", e);

      try {
        await Kaya.sendMessage(
          m.chat,
          {
            text: "❌ Update failed",
            contextInfo: getContextInfo(),
          },
          { quoted: m }
        );
      } catch {}
    }
  },
};