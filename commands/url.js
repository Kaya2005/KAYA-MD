import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
  name: "url",
  alias: ["tourl"],
  description: "Upload a replied image to Catbox and get its URL",
  category: "Tools",

  run: async (kaya, m, args) => {
    try {
      const quoted =
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted?.imageMessage) {
        return kaya.sendMessage(
          m.chat,
          {
            text: "⚠️ Reply to an image with .url"
          },
          { quoted: m }
        );
      }

      const stream = await downloadContentFromMessage(
        quoted.imageMessage,
        "image"
      );

      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", buffer, "image.jpg");

      const { data: url } = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        {
          headers: form.getHeaders()
        }
      );

      const message = `
╭────「 URL GENERATOR 」────⬣
│ 📤 Image uploaded successfully!
│ 🔗 Catbox Link:
│ ${url}
╰──────────────────⬣`.trim();

      await kaya.sendMessage(
        m.chat,
        {
          text: message
        },
        { quoted: m }
      );

    } catch (error) {
      console.error("❌ URL command error:", error);

      await kaya.sendMessage(
        m.chat,
        {
          text: "❌ Failed to upload image to Catbox."
        },
        { quoted: m }
      );
    }
  }
};