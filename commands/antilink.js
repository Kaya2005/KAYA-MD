import checkAdminOrOwner from "../system/checkAdmin.js";
import fs from "fs";
import path from "path";

// 📂 Fichiers de données
const DATA_DIR = path.join(process.cwd(), "data");
const ANTI_LINK_FILE = path.join(DATA_DIR, "antilink.json");
const WARNS_FILE = path.join(DATA_DIR, "warns.json");

// Crée le dossier si inexistant
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// 🔹 Load / Save helpers
const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return {};
  }
};

const saveJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// ----------------- Global Init -----------------
global.antiLinkGroups ??= loadJSON(ANTI_LINK_FILE);
global.userWarns ??= loadJSON(WARNS_FILE);

// ----------------- Save Wrappers -----------------
const saveAntiLink = () => saveJSON(ANTI_LINK_FILE, global.antiLinkGroups);
const saveUserWarns = () => saveJSON(WARNS_FILE, global.userWarns);

// ==================== EXPORT ====================
export default {
  name: "antilink",
  description: "Anti-link with delete, warn or kick options",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      if (!m.isGroup) return kaya.sendMessage(chatId, { text: "❌ This command only works in groups." }, { quoted: m });

      const action = args[0]?.toLowerCase();
      if (!["on", "off", "delete", "warn", "kick", "status"].includes(action)) {
        return kaya.sendMessage(chatId, { text:
`🔗 *ANTI-LINK COMMAND*

.antilink on      → Enable (WARN mode)
.antilink off     → Disable
.antilink delete  → Delete links automatically
.antilink warn    → 4 warnings = kick
.antilink kick    → Direct kick
.antilink status  → Show current status`
        }, { quoted: m });
      }

      // STATUS
      if (action === "status") {
        const data = global.antiLinkGroups[chatId];
        return kaya.sendMessage(chatId, { text: data?.enabled
          ? `✅ Anti-link ENABLED\n📊 Mode: ${data.mode.toUpperCase()}`
          : "❌ Anti-link is disabled."}, { quoted: m });
      }

      // Admin check
      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdminOrOwner) return kaya.sendMessage(chatId, { text: "🚫 Admins only." }, { quoted: m });

      // Bot admin check
      const meta = await kaya.groupMetadata(chatId).catch(() => null);
      const botIsAdmin = meta?.participants.some(p => p.jid === kaya.user.jid && p.admin);
      if (!botIsAdmin && action !== "off") return kaya.sendMessage(chatId, { text: "❌ I must be admin first." }, { quoted: m });

      // ---------- ACTIONS ----------
      if (action === "on") global.antiLinkGroups[chatId] = { enabled: true, mode: "warn" };
      else if (action === "off") {
        delete global.antiLinkGroups[chatId];
        delete global.userWarns[chatId];
      } else if (["delete","warn","kick"].includes(action)) {
        global.antiLinkGroups[chatId] = { enabled: true, mode: action };
      }

      // Save all changes
      saveAntiLink();
      saveUserWarns();

      return kaya.sendMessage(chatId, { text:
        action === "off" ? "❌ Anti-link disabled & warns reset."
        : `✅ Anti-link ${action === "on" ? "enabled (WARN mode)" : "mode set to " + action.toUpperCase()}`
      }, { quoted: m });

    } catch (err) {
      console.error("❌ antilink.js error:", err);
    }
  },

  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const chatId = m.chat;
      const data = global.antiLinkGroups[chatId];
      if (!data?.enabled) return;

      const sender = m.sender;
      const mode = data.mode;

      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me)/i;
      if (!linkRegex.test(m.body)) return;

      // Delete message
      try { await kaya.sendMessage(chatId, { delete: m.key }); } catch {}

      // Kick direct
      if (mode === "kick") return kaya.groupParticipantsUpdate(chatId, [sender], "remove");

      // Warn
      if (mode === "warn") {
        global.userWarns[chatId] ??= {};
        global.userWarns[chatId][sender] = (global.userWarns[chatId][sender] || 0) + 1;
        saveUserWarns();

        const warns = global.userWarns[chatId][sender];
        await kaya.sendMessage(chatId, {
          text: `⚠️ ANTI-LINK\n👤 @${sender.split("@")[0]}\n📊 Warning: ${warns}/4`,
          mentions: [sender]
        });

        if (warns >= 4) {
          delete global.userWarns[chatId][sender];
          saveUserWarns();
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        }
      }

    } catch (err) {
      console.error("❌ AntiLink detect error:", err);
    }
  }
};