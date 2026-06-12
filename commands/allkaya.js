export default {
  name: "allkaya",
  description: "📢 Send a message to all groups (Owner only)",
  category: "Owner",
  ownerOnly: true,
  usage: ".allkaya <message> | <image_url (optional)>",

  run: async (kaya, m, args) => {
    try {
      const input = args.join(" ").trim();
      if (!input)
        return kaya.sendMessage(m.chat, { text: "❌ Please provide a message." }, { quoted: m });

      let [text, imageUrl] = input.split("|").map(s => s.trim());

      // ✅ Récupération des groupes
      const groupsData = await kaya.groupFetchAllParticipating();
      const groups = Object.values(groupsData).filter(g => g.id && g.participants?.length);

      if (!groups.length)
        return kaya.sendMessage(m.chat, { text: "❌ No groups found." }, { quoted: m });

      let success = 0;
      let failed = 0;

      for (const group of groups) {
        try {
          const jid = group.id;

          // Prépare le message
          const message = imageUrl
            ? { image: { url: imageUrl }, caption: text }
            : { text };

          await kaya.sendMessage(jid, message);
          success++;

          // 🔹 Pause anti-ban
          await new Promise(r => setTimeout(r, 1200));

        } catch (err) {
          failed++;
          console.error(`❌ Failed to send to ${group.id}:`, err?.message || err);
        }
      }

      return kaya.sendMessage(m.chat, {
        text: `📢 Broadcast completed!\n\n✅ Success: ${success}\n❌ Failed: ${failed}`
      }, { quoted: m });

    } catch (err) {
      console.error("❌ allkaya error:", err);
      return kaya.sendMessage(m.chat, {
        text: "❌ An error occurred while sending messages."
      }, { quoted: m });
    }
  }
};