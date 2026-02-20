import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

// 📂 Fichier pour sauvegarder les groupes avec anti-channel
const antiChannelFile = path.join(process.cwd(), "data/antiChannelGroups.json");

// ----------------- Load & Save -----------------
function loadAntiChannelGroups() {
  try {
    if (fs.existsSync(antiChannelFile)) {
      return JSON.parse(fs.readFileSync(antiChannelFile, "utf-8"));
    }
  } catch (err) {
    console.error("❌ Error loading antiChannelGroups.json:", err);
  }
  return {};
}

function saveAntiChannelGroups() {
  try {
    fs.writeFileSync(
      antiChannelFile,
      JSON.stringify(global.antiChannelGroups, null, 2)
    );
  } catch (err) {
    console.error("❌ Error saving antiChannelGroups.json:", err);
  }
}

// ----------------- Global Initialization -----------------
if (!global.antiChannelGroups) global.antiChannelGroups = loadAntiChannelGroups();
if (!global.userChannelWarns) global.userChannelWarns = {};

export default {
  name: "antiChannel",
  description: "Supprime les actus/updates partagées depuis les chaînes WhatsApp",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  // ==================== COMMAND ====================
  run: async (kaya, m, args) => {
    const chatId = m.chat;

    if (!m.isGroup) {
      return kaya.sendMessage(chatId, { text: "❌ Cette commande ne fonctionne que dans les groupes." }, { quoted: m });
    }

    const action = args[0]?.toLowerCase();
    if (!action || !["on", "off", "warn", "kick", "status"].includes(action)) {
      return kaya.sendMessage(chatId, {
        text:
`📛 *ANTI-ACTUS CHANNEL COMMAND*
.antiChannelActu on      → Enable (WARN mode)
.antiChannelActu off     → Disable
.antiChannelActu warn    → 4 warnings = kick
.antiChannelActu kick    → Direct kick
.antiChannelActu status  → Show current status`
      }, { quoted: m });
    }

    // 📊 STATUS
    if (action === "status") {
      const data = global.antiChannelGroups[chatId];
      const enabled = data?.enabled ? "✅ Activé" : "❌ Désactivé";
      const mode = data?.mode?.toUpperCase() || "WARN";
      return kaya.sendMessage(chatId, { text: `📊 Anti-actu-channel: ${enabled}\n📊 Mode: ${mode}` }, { quoted: m });
    }

    // 🔐 Vérification Admin/Owner
    const check = await checkAdminOrOwner(kaya, chatId, m.sender);
    if (!check.isAdminOrOwner) {
      return kaya.sendMessage(chatId, { text: "🚫 Seulement pour les admins ou le propriétaire." }, { quoted: m });
    }

    // ---------- ACTIONS ----------
    if (action === "on" || action === "warn") {
      global.antiChannelGroups[chatId] = { enabled: true, mode: "warn" };
      saveAntiChannelGroups();
      return kaya.sendMessage(chatId, { text: "✅ Anti-actus activé\n⚠️ WARN mode (4 warnings = kick)" }, { quoted: m });
    }

    if (action === "kick") {
      global.antiChannelGroups[chatId] = { enabled: true, mode: "kick" };
      saveAntiChannelGroups();
      return kaya.sendMessage(chatId, { text: "✅ Anti-actus activé\n🚫 Kick direct mode" }, { quoted: m });
    }

    if (action === "off") {
      delete global.antiChannelGroups[chatId];
      delete global.userChannelWarns[chatId];
      saveAntiChannelGroups();
      return kaya.sendMessage(chatId, { text: "❌ Anti-actus désactivé." }, { quoted: m });
    }
  },

  // ==================== DETECTION ====================
  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const chatId = m.chat;
      if (!global.antiChannelGroups?.[chatId]?.enabled) return;

      const sender = m.sender;
      const mode = global.antiChannelGroups[chatId].mode || "warn";

      // ✅ Skip admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      // 🔍 Détection uniquement des actus de chaînes WhatsApp
      // Actus apparaissent souvent comme messages forwardés depuis "status@broadcast"
      const isChannelActu = m.key.remoteJid === "status@broadcast" || m.message?.ephemeralMessage?.message?.videoMessage?.caption?.includes("channel") || m.message?.viewOnceMessage;
      if (!isChannelActu) return;

      // 🗑️ Supprime le message
      await kaya.sendMessage(chatId, { delete: m.key }).catch(() => {});

      if (mode === "kick") {
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        return;
      }

      if (mode === "warn") {
        if (!global.userChannelWarns[chatId]) global.userChannelWarns[chatId] = {};
        global.userChannelWarns[chatId][sender] = (global.userChannelWarns[chatId][sender] || 0) + 1;

        const warns = global.userChannelWarns[chatId][sender];

        await kaya.sendMessage(chatId, {
          text:
`⚠️ ANTI-ACTUS
👤 @${sender.split("@")[0]}
📊 Warning: ${warns}/4`,
          mentions: [sender]
        });

        if (warns >= 4) {
          delete global.userChannelWarns[chatId][sender];
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        }
      }

    } catch (e) {
      console.error("❌ AntiChannel detect error:", e);
    }
  }
};