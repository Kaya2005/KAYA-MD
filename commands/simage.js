import sharp from 'sharp';
import fs from 'fs';
import fsPromises from 'fs/promises';
import fse from 'fs-extra';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import chalk from 'chalk';

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Supprime automatiquement les fichiers temporaires après un délai
const scheduleFileDeletion = (filePath) => {
  setTimeout(async () => {
    try {
      await fse.remove(filePath);
      console.log(chalk.green(`File deleted: ${filePath}`));
    } catch (error) {
      console.error(chalk.red(`Failed to delete file:`), error);
    }
  }, 10 * 1000); // 10 secondes
};

export default {
  name: "simage",
  description: "Convert a sticker to an image",
  category: "Fun",
  group: false,
  admin: false,
  botAdmin: false,

  run: async (kaya, m, args) => {
    const chatId = m.chat;
    const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    try {
      if (!quotedMessage || !quotedMessage.stickerMessage) {
        await kaya.sendMessage(chatId, { text: 'Reply to a sticker with .simage to convert it.' }, { quoted: m });
        return;
      }

      const stickerFilePath = path.join(tempDir, `sticker_${Date.now()}.webp`);
      const outputImagePath = path.join(tempDir, `converted_image_${Date.now()}.png`);

      const stream = await downloadContentFromMessage(quotedMessage.stickerMessage, 'sticker');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      await fsPromises.writeFile(stickerFilePath, buffer);
      await sharp(stickerFilePath).toFormat('png').toFile(outputImagePath);

      const imageBuffer = await fsPromises.readFile(outputImagePath);
      await kaya.sendMessage(chatId, { image: imageBuffer, caption: '✅ Here is your converted image!' }, { quoted: m });

      scheduleFileDeletion(stickerFilePath);
      scheduleFileDeletion(outputImagePath);

    } catch (error) {
      console.error(chalk.red('❌ Error in simage command:'), error);
      await kaya.sendMessage(chatId, { text: '❌ An error occurred while converting the sticker.' }, { quoted: m });
    }
  }
};