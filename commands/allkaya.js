export default {
  name: "allkaya",
  description: "📢 Send a message (text + link + image) to all groups (Owner only)",
  category: "Owner",
  ownerOnly: true,
  usage: ".allkaya <message> | <image_url (optional)>",

  run: async (kaya, m, args) => {
    try {
      // 🔹 Récupération du message
      const input = args.join(" ").trim();
      if (!input) return kaya.sendMessage(m.chat, { text: "❌ Please provide a message." }, { quoted: m });

      // 🔹 Vérifier si un lien d'image est fourni (séparé par "|")
      let [text, imageUrl] = input.split("|").map(s => s.trim());

      // 🔹 Récupérer tous les groupes
      const chats = await kaya.chats.all();
      const groups = chats.filter(c => c.jid.endsWith("@g.us"));

      if (groups.length === 0) {
        return kaya.sendMessage(m.chat, { text: "❌ No groups found." }, { quoted: m });
      }

      // 🔹 Envoyer le message à tous les groupes
      let success = 0;
      let failed = 0;

      for (const group of groups) {
        try {
          const message = imageUrl
            ? { image: { url: imageUrl }, caption: text }
            : { text };
          await kaya.sendMessage(group.jid, message);
          success++;
        } catch (err) {
          failed++;
          console.error(`❌ Failed to send to ${group.jid}:`, err);
        }
      }

      // 🔹 Résumé
      return kaya.sendMessage(m.chat, {
        text: `📢 Message sent to all groups!\n✅ Success: ${success}\n❌ Failed: ${failed}`
      }, { quoted: m });

    } catch (err) {
      console.error("❌ allkaya error:", err);
      kaya.sendMessage(m.chat, { text: "❌ An error occurred while sending messages to all groups." }, { quoted: m });
    }
  }
};