// ==================== commands/antiStatus.js ====================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

// 📂 Fichier pour sauvegarder les groupes
const antiStatusFile = path.join(process.cwd(), "data/antiStatusGroups.json");

// ----------------- Load & Save -----------------
function loadAntiStatusGroups() {
  try {
    if (fs.existsSync(antiStatusFile)) {
      return JSON.parse(fs.readFileSync(antiStatusFile, "utf-8"));
    }
  } catch (err) {
    console.error("❌ Error loading antiStatusGroups.json:", err);
  }
  return {};
}

function saveAntiStatusGroups() {
  try {
    fs.writeFileSync(
      antiStatusFile,
      JSON.stringify(global.antiStatusGroups, null, 2)
    );
  } catch (err) {
    console.error("❌ Error saving antiStatusGroups.json:", err);
  }
}

// ----------------- Global Initialization -----------------
if (!global.antiStatusGroups) global.antiStatusGroups = loadAntiStatusGroups();
if (!global.userStatusWarns) global.userStatusWarns = {};

// ================== MODULE ==================
export default {
  name: "antiStatus",
  description: "Supprime automatiquement les statuts WhatsApp dans les groupes",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  // ==================== COMMAND ====================
  run: async (kaya, m, args) => {
    const chatId = m.chat;

    if (!m.isGroup) {
      return kaya.sendMessage(
        chatId,
        { text: "❌ Cette commande ne fonctionne que dans les groupes." },
        { quoted: m }
      );
    }

    const action = args[0]?.toLowerCase();
    if (!action || !["on", "off", "warn", "kick", "status"].includes(action)) {
      return kaya.sendMessage(
        chatId,
        {
          text:
`📛 *ANTI-STATUS COMMAND*
.antiStatus on      → Activer (mode WARN)
.antiStatus off     → Désactiver
.antiStatus warn    → 4 warnings = kick
.antiStatus kick    → Kick direct
.antiStatus status  → Affiche l'état actuel`
        },
        { quoted: m }
      );
    }

    // 📊 STATUS
    if (action === "status") {
      const data = global.antiStatusGroups[chatId];
      const enabled = data?.enabled ? "✅ Activé" : "❌ Désactivé";
      const mode = data?.mode?.toUpperCase() || "WARN";
      return kaya.sendMessage(
        chatId,
        { text: `📊 Anti-status: ${enabled}\n📊 Mode: ${mode}` },
        { quoted: m }
      );
    }

    // 🔐 Vérification Admin/Owner
    const check = await checkAdminOrOwner(kaya, chatId, m.sender);
    if (!check.isAdminOrOwner) {
      return kaya.sendMessage(
        chatId,
        { text: "🚫 Seulement pour les admins ou le propriétaire." },
        { quoted: m }
      );
    }

    // ---------- ACTIONS ----------
    if (action === "on" || action === "warn") {
      global.antiStatusGroups[chatId] = { enabled: true, mode: "warn" };
      saveAntiStatusGroups();
      return kaya.sendMessage(
        chatId,
        { text: "✅ Anti-status activé\n⚠️ Mode WARN (4 warnings = kick)" },
        { quoted: m }
      );
    }

    if (action === "kick") {
      global.antiStatusGroups[chatId] = { enabled: true, mode: "kick" };
      saveAntiStatusGroups();
      return kaya.sendMessage(
        chatId,
        { text: "✅ Anti-status activé\n🚫 Mode Kick direct" },
        { quoted: m }
      );
    }

    if (action === "off") {
      delete global.antiStatusGroups[chatId];
      delete global.userStatusWarns[chatId];
      saveAntiStatusGroups();
      return kaya.sendMessage(
        chatId,
        { text: "❌ Anti-status désactivé." },
        { quoted: m }
      );
    }
  },

  // ==================== DETECTION ====================
  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const chatId = m.chat;
      if (!global.antiStatusGroups?.[chatId]?.enabled) return;

      const sender = m.sender;
      const mode = global.antiStatusGroups[chatId].mode || "warn";

      // ✅ Skip admin/owner
      const check = await checkAdminOrOwner(kaya, chatId, sender);
      if (check.isAdminOrOwner) return;

      // 🔥 DETECTION STATUS WHATSAPP
      const isStatus =
        m.message?.protocolMessage?.type === 14 ||
        /votre statut/i.test(m.body || "");

      if (!isStatus) return;

      // 🗑️ Supprime le message
      await kaya.sendMessage(chatId, { delete: m.key }).catch(() => {});

      if (mode === "kick") {
        await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        return;
      }

      if (mode === "warn") {
        global.userStatusWarns[chatId] ??= {};
        global.userStatusWarns[chatId][sender] =
          (global.userStatusWarns[chatId][sender] || 0) + 1;

        const warns = global.userStatusWarns[chatId][sender];

        await kaya.sendMessage(chatId, {
          text: `⚠️ *ANTI-STATUS*\n👤 @${sender.split("@")[0]}\n📊 Warning: ${warns}/4`,
          mentions: [sender]
        });

        if (warns >= 4) {
          delete global.userStatusWarns[chatId][sender];
          await kaya.groupParticipantsUpdate(chatId, [sender], "remove");
        }
      }

    } catch (e) {
      console.error("❌ AntiStatus detect error:", e);
    }
  }
};