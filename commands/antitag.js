// ==================== commands/antitag.js ====================
import fs from "fs";
import path from "path";
import checkAdminOrOwner from "../system/checkAdmin.js";

// 📂 Fichier de sauvegarde
const antitagFile = path.join(process.cwd(), "data/antiTagGroups.json");

// ----------------- Load & Save -----------------
function loadAntitagGroups() {
  try {
    if (fs.existsSync(antitagFile)) {
      return JSON.parse(fs.readFileSync(antitagFile, "utf-8"));
    }
  } catch (err) {
    console.error("❌ Error loading antiTagGroups.json:", err);
  }
  return {};
}

function saveAntitagGroups() {
  try {
    fs.writeFileSync(
      antitagFile,
      JSON.stringify(global.antiTagGroups, null, 2)
    );
  } catch (err) {
    console.error("❌ Error saving antiTagGroups.json:", err);
  }
}

// ----------------- Global init -----------------
global.antiTagGroups ??= loadAntitagGroups();

// ==================== EXPORT COMMANDE ====================
export default {
  name: "antitag",
  alias: ["anti-tag"],
  description: "🚫 Anti tagall / mentions",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  // ==================== COMMAND ====================
  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;
      const action = args[0]?.toLowerCase();

      if (!m.isGroup) {
        return kaya.sendMessage(
          chatId,
          { text: "❌ Cette commande fonctionne uniquement dans les groupes." },
          { quoted: m }
        );
      }

      // 🔐 Check admin / owner
      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdminOrOwner) {
        return kaya.sendMessage(
          chatId,
          { text: "🚫 Seuls les admins ou le propriétaire peuvent utiliser cette commande." },
          { quoted: m }
        );
      }

      // 📖 Help
      if (!action) {
        return kaya.sendMessage(
          chatId,
          {
            text: `🚫 *ANTITAG*

.antitag on
→ Activer l'antitag (DELETE)

.antitag off
→ Désactiver l'antitag

.antitag set delete
→ Supprimer le message

.antitag set kick
→ Kick l'utilisateur

.antitag get
→ Voir le statut`
          },
          { quoted: m }
        );
      }

      // 📊 STATUS
      if (action === "get") {
        const data = global.antiTagGroups[chatId];
        return kaya.sendMessage(
          chatId,
          {
            text: `📊 *ANTITAG STATUS*
• État   : ${data?.enabled ? "ON ✅" : "OFF ❌"}
• Action : ${data?.action || "—"}`
          },
          { quoted: m }
        );
      }

      // ⚙️ ACTIONS
      if (action === "on") {
        global.antiTagGroups[chatId] = { enabled: true, action: "delete" };
        saveAntitagGroups();
        return kaya.sendMessage(chatId, { text: "✅ Antitag activé (DELETE)." }, { quoted: m });
      }

      if (action === "off") {
        delete global.antiTagGroups[chatId];
        saveAntitagGroups();
        return kaya.sendMessage(chatId, { text: "❌ Antitag désactivé." }, { quoted: m });
      }

      if (action === "set") {
        const mode = args[1];
        if (!["delete", "kick"].includes(mode)) {
          return kaya.sendMessage(
            chatId,
            { text: "⚠️ Utilisation : .antitag set delete | kick" },
            { quoted: m }
          );
        }

        global.antiTagGroups[chatId] = { enabled: true, action: mode };
        saveAntitagGroups();
        return kaya.sendMessage(
          chatId,
          { text: `⚙️ Action antitag définie sur : ${mode.toUpperCase()}` },
          { quoted: m }
        );
      }

    } catch (err) {
      console.error("❌ ANTITAG COMMAND ERROR:", err);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Erreur lors de l'exécution de la commande antitag." },
        { quoted: m }
      );
    }
  },

  // ==================== DETECT ====================
  detect: async (kaya, m) => {
    try {
      if (!m.isGroup || m.key?.fromMe) return;

      const data = global.antiTagGroups?.[m.chat];
      if (!data?.enabled) return;

      // Skip admin / owner
      const check = await checkAdminOrOwner(kaya, m.chat, m.sender);
      if (check.isAdminOrOwner) return;

      // Detect mention / tagall
      const mentions = m.mentionedJid || [];
      const hasMention = mentions.length > 0 || /@all/i.test(m.body);
      if (!hasMention) return;

      // 🗑️ Delete message
      await kaya.sendMessage(m.chat, { delete: m.key }).catch(() => {});

      // 🚫 Kick si activé
      if (data.action === "kick") {
        await kaya.groupParticipantsUpdate(m.chat, [m.sender], "remove").catch(() => {});
      }

    } catch (err) {
      console.error("❌ ANTITAG DETECT ERROR:", err);
    }
  }
};