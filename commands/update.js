import { execSync } from "child_process";
import { getContextInfo } from "../system/contextInfo.js";

const REPO_DIR = process.cwd();

/* ================= GIT HELPERS ================= */
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
      if (!m.fromMe) {
        return Kaya.sendMessage(
          m.chat,
          {
            text: "❌ Owner only command.",
            contextInfo: getContextInfo(),
          },
          { quoted: m }
        );
      }

      const localBefore = getLocalCommit();

      let msg = await Kaya.sendMessage(
        m.chat,
        {
          text: `🔄 Checking for updates...\n${bar(10)}`,
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

      /* ================= FETCH ================= */
      await sleep(400);
      await edit(`🔍 Verifying repository...\n${bar(25)}`);

      execSync(`git -C ${REPO_DIR} fetch`, { stdio: "ignore" });

      const remote = getRemoteCommit();

      if (!remote) {
        return edit("❌ Failed to check remote repository.");
      }

      /* ================= PULL ================= */
      await sleep(400);
      await edit(`⬇️ Downloading updates...\n${bar(50)}`);

      execSync(`git -C ${REPO_DIR} reset --hard`, { stdio: "ignore" });
      execSync(`git -C ${REPO_DIR} pull`, { stdio: "ignore" });

      /* ================= ANALYSIS ================= */
      await sleep(400);
      await edit(`⚙️ Analyzing changes...\n${bar(80)}`);

      const changed = getChangedFiles();
      const localAfter = getLocalCommit();

      /* ================= NO UPDATE ================= */
      if (!changed.length) {
        return edit(
`📦 ALREADY UP TO DATE
${bar(100)}

✔ No changes detected
⚡ Bot is already running the latest version`
        );
      }

      /* ================= UPDATE DONE ================= */
      await sleep(400);

      await edit(
`🚀 UPDATE COMPLETED
${bar(100)}

📌 Current commit:
${localAfter || "N/A"}

📂 Modified files (${changed.length}):
${changed.slice(0, 6).map(f => `• ${f}`).join("\n")}

♻️ Restarting bot...`
      );

      setTimeout(() => {
        process.exit(0);
      }, 1500);

    } catch (e) {
      console.error("UPDATE ERROR:", e);

      try {
        await Kaya.sendMessage(
          m.chat,
          {
            text: "❌ Update failed.",
            contextInfo: getContextInfo(),
          },
          { quoted: m }
        );
      } catch {}
    }
  },
};