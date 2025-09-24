// commands/ai.js
import axios from "axios";

export default {
  name: "ai",
  description: "Discute avec l’IA (GPT-3 via stablediffusion.fr)",
  category: "Outils",
  group: false,
  admin: false,

  run: async (kaya, m, msg, store, args) => {
    try {
      if (!args || args.length === 0) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Utilisation : .ai <votre question>" },
          { quoted: m }
        );
      }

      const prompt = args.join(" ");

      // Requête API
      const response = await axios.post(
        "https://stablediffusion.fr/gpt3/predict",
        { prompt },
        {
          headers: {
            "Content-Type": "application/json",
            "Referer": "https://stablediffusion.fr/chatgpt3",
            "Origin": "https://stablediffusion.fr",
            "User-Agent": "Mozilla/5.0"
          }
        }
      );

   
      const reply = response.data?.message || "❌ Aucune réponse reçue.";

      await kaya.sendMessage(m.chat, { text: reply }, { quoted: m });

    } catch (err) {
      console.error("Erreur commande AI :", err);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Erreur lors de la requête à l’IA." },
        { quoted: m }
      );
    }
  }
};