// ==================== commands/left.js ====================
import { getContextInfo } from "../system/contextInfo.js";

export default {
  name: "left",
  description: "🚪 Bot leaves the group (absolute security)",
  category: "Groupe",

  run: async (kaya, m) => {
    try {
      // 🔐 Absolute security
      if (!m.fromMe) return;

      // 📛 Group only
      if (!m.isGroup) {
        return kaya.sendMessage(
          m.chat,
          {
            text: "❗ This command can only be used in a group.",
            contextInfo: getContextInfo()
          },
          { quoted: m }
        );
      }

      // 🚪 Leave group silently
      await kaya.groupLeave(m.chat);

    } catch (err) {
      console.error("❌ Left command error:", err);
    }
  }
};