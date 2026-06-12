//botAssets.js

import fs from 'fs';
import path from 'path';

// ===================== BOT CORE =====================

// Bot version
export const BOT_VERSION = '1';

// Bot slogan
export const BOT_SLOGAN = '  `『 BY 𝐊𝐀𝐘𝐀²⁰²⁶』`';

// File to persist bot name
const botNameFile = path.join(process.cwd(), 'system', 'botName.json');

// File to persist bot image URL / path
const botImageFile = path.join(process.cwd(), 'system', 'botImage.json');

// Default bot name
export let BOT_NAME = '𝐊𝐀𝐘𝐀 𝐁𝐎𝐓';

// Default bot image (URL)
let botImagePath = 'https://files.catbox.moe/1ddhgm.jpg';

// Local fallback image (always exists)
const localFallbackImage = path.join(process.cwd(), 'system', 'bot.jpg');

// ===================== LOAD SAVED DATA =====================

// Load saved bot name
if (fs.existsSync(botNameFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(botNameFile, 'utf-8'));
    if (data?.name) BOT_NAME = data.name;
  } catch (e) {
    console.error('❌ Failed to load bot name:', e);
  }
}

// Load saved bot image
if (fs.existsSync(botImageFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(botImageFile, 'utf-8'));
    if (data?.url) botImagePath = data.url;
  } catch (e) {
    console.error('❌ Failed to load bot image:', e);
  }
}

// ===================== BOT NAME HELPERS =====================

export function getBotName() {
  return BOT_NAME;
}

export function setBotName(name) {
  BOT_NAME = name;
  fs.writeFileSync(botNameFile, JSON.stringify({ name }, null, 2));
}

// ===================== BOT IMAGE HELPERS =====================

export function setBotImage(value) {
  botImagePath = value;
  fs.writeFileSync(botImageFile, JSON.stringify({ url: value }, null, 2));
}

// ===================== BOT IMAGE PAYLOAD =====================
// URL → LOCAL → FALLBACK

export function getBotImagePayload() {
  // 1️⃣ Image en ligne
  if (botImagePath && botImagePath.startsWith('http')) {
    return { type: 'url', value: botImagePath };
  }

  // 2️⃣ Image locale définie
  if (botImagePath) {
    const localPath = path.isAbsolute(botImagePath)
      ? botImagePath
      : path.join(process.cwd(), botImagePath);

    if (fs.existsSync(localPath)) {
      return { type: 'buffer', value: fs.readFileSync(localPath) };
    }
  }

  // 3️⃣ Fallback final : system/bot.jpg
  if (fs.existsSync(localFallbackImage)) {
    return { type: 'buffer', value: fs.readFileSync(localFallbackImage) };
  }

  return null;
}

// ✅ ALIAS POUR COMPATIBILITÉ
export function getBotImage() {
  return getBotImagePayload();
}

// ===================== UNIVERSAL IMAGE SENDER =====================

/**
 * Envoie un message avec l'image du bot
 * URL → (si échec) image locale → texte seul
 */
export async function sendWithBotImage(kaya, chat, content = {}, options = {}) {
  const payload = getBotImagePayload();

  // 1️⃣ Essai avec image URL
  if (payload?.type === 'url') {
    try {
      await kaya.sendMessage(
        chat,
        {
          image: { url: payload.value },
          ...content
        },
        options
      );
      return; // ✅ succès → stop ici
    } catch (err) {
      console.warn('⚠️ Image URL failed, fallback to local image');
    }
  }

  // 2️⃣ Essai avec image locale (system/bot.jpg)
  try {
    if (!fs.existsSync(localFallbackImage)) {
      throw new Error('Local fallback image missing');
    }

    const buffer = fs.readFileSync(localFallbackImage);

    await kaya.sendMessage(
      chat,
      {
        image: buffer,
        ...content
      },
      options
    );
    return;
  } catch (err) {
    console.warn('⚠️ Local image failed, sending text only');
  }

  // 3️⃣ Dernier recours : texte seul
  if (content.caption) {
    await kaya.sendMessage(chat, { text: content.caption }, options);
  } else {
    await kaya.sendMessage(chat, content, options);
  }
}

// ===================== CONNECTION MESSAGE =====================

export function connectionMessage() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const date = now.toLocaleDateString('en-GB');

  return `
▉ \`${BOT_NAME}\` ▉
▰▰▰▰▰▰▰▰▰▰▰▰▰
*⏱️ : ${time} • GMT*
*📅 : ${date}*
*🟢 STATUS : CONNECTED*
*🧪 VERSION : v${BOT_VERSION}*
______________________

${BOT_SLOGAN}
`;
}