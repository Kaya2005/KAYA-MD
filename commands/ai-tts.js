import axios from "axios";
import FormData from "form-data";

const VOICES = [
  "nova",
  "alloy",
  "ash",
  "coral",
  "echo",
  "fable",
  "onyx",
  "sage",
  "shimmer"
];

function getVoice(v) {
  if (!v) return "coral";
  v = v.toLowerCase();
  return VOICES.includes(v) ? v : "coral";
}

async function generateTTS(text, voice = "coral", speed = "1.0") {
  const form = new FormData();
  form.append("msg", text);
  form.append("lang", voice);
  form.append("speed", speed);
  form.append("source", "ttsmp3");

  const { data } = await axios.post(
    "https://ttsmp3.com/makemp3_ai.php",
    form,
    { headers: form.getHeaders() }
  );

  if (data?.URL) return data.URL;
  return null;
}

export default {
  name: "tts",
  description: "🎙️ Text to speech",
  category: "AI",

  run: async (kaya, m, args) => {
    try {

      if (!args[0]) {
        return kaya.sendMessage(
          m.chat,
          {
            text:
`🎙️ *TTS Command*

Example:
.tts Bonjour

With voice:
.tts nova Bonjour

Voices:
nova
alloy
ash
coral
echo
fable
onyx
sage
shimmer`
          },
          { quoted: m }
        );
      }

      let voice = "coral";
      let text = args.join(" ");

      if (VOICES.includes(args[0].toLowerCase())) {
        voice = args[0].toLowerCase();
        text = args.slice(1).join(" ");
      }

      if (!text) {
        return kaya.sendMessage(
          m.chat,
          { text: "⚠️ Give a text." },
          { quoted: m }
        );
      }

      await kaya.sendMessage(m.chat, { react: { text: "🎙️", key: m.key } });

      const url = await generateTTS(text, voice);

      if (!url) {
        return kaya.sendMessage(
          m.chat,
          { text: "❌ Failed to generate voice." },
          { quoted: m }
        );
      }

      await kaya.sendMessage(
        m.chat,
        {
          audio: { url },
          mimetype: "audio/mpeg",
          ptt: true
        },
        { quoted: m }
      );

    } catch (err) {
      console.error(err);
      await kaya.sendMessage(
        m.chat,
        { text: "❌ Error generating TTS." },
        { quoted: m }
      );
    }
  }
};