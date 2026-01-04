// ==================== commands/antitag.js ====================
import { setAntitag, getAntitag, removeAntitag } from "../lib/antitag.js";
import { contextInfo } from "../system/contextInfo.js";
import checkAdminOrOwner from "../system/checkAdmin.js";

export default {
  name: "antitag",
  alias: ["anti-tag", "tagall"],
  description: "🚫 Configure the anti-tagall system",
  category: "Groupe",
  group: true,
  admin: true,
  botAdmin: true,

  // ==================== COMMAND ====================
  run: async (kaya, m, args) => {
    try {
      const chatId = m.chat;

      if (!m.isGroup) {
        return kaya.sendMessage(
          chatId,
          { text: "❌ This command only works in groups.", contextInfo },
          { quoted: m }
        );
      }

      const action = args[0]?.toLowerCase();

      // 📖 Help menu
      if (!action) {
        return kaya.sendMessage(
          chatId,
          {
            text: `🚫 *ANTITAG SYSTEM*

.antitag on
→ Enable antitag (default action: DELETE)

.antitag off
→ Disable antitag

.antitag set delete
→ Delete tagall messages

.antitag set kick
→ Kick user on tagall

.antitag get
→ Show antitag status`,
            contextInfo
          },
          { quoted: m }
        );
      }

      // 📊 GET STATUS
      if (action === "get") {
        const data = await getAntitag(chatId);
        return kaya.sendMessage(
          chatId,
          {
            text:
`📊 *ANTITAG STATUS*
• State  : ${data?.enabled ? "ON ✅" : "OFF ❌"}
• Action : ${data?.action || "—"}`,
            contextInfo
          },
          { quoted: m }
        );
      }

      // 🔐 Admin / Owner check
      const check = await checkAdminOrOwner(kaya, chatId, m.sender);
      if (!check.isAdminOrOwner) {
        return kaya.sendMessage(
          chatId,
          { text: "🚫 Only admins or owner can use this command.", contextInfo },
          { quoted: m }
        );
      }

      // ⚙️ ACTIONS
      switch (action) {
        case "on":
          await setAntitag(chatId, true, "delete");
          return kaya.sendMessage(
            chatId,
            { text: "✅ Antitag enabled (action: DELETE).", contextInfo },
            { quoted: m }
          );

        case "off":
          await removeAntitag(chatId);
          return kaya.sendMessage(
            chatId,
            { text: "❌ Antitag disabled.", contextInfo },
            { quoted: m }
          );

        case "set": {
          const mode = args[1];
          if (!["delete", "kick"].includes(mode)) {
            return kaya.sendMessage(
              chatId,
              { text: "⚠️ Usage: .antitag set delete | kick", contextInfo },
              { quoted: m }
            );
          }

          await setAntitag(chatId, true, mode);
          return kaya.sendMessage(
            chatId,
            { text: `⚙️ Antitag action set to: ${mode.toUpperCase()}`, contextInfo },
            { quoted: m }
          );
        }

        default:
          return kaya.sendMessage(
            chatId,
            { text: "❓ Unknown option. Type .antitag", contextInfo },
            { quoted: m }
          );
      }

    } catch (err) {
      console.error("❌ ANTITAG COMMAND ERROR:", err);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Error while processing antitag command.", contextInfo },
        { quoted: m }
      );
    }
  }
};