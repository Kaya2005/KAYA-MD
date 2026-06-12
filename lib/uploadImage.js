// ==================== uploadImage.js ====================

import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import path from 'path';

/**
 * Upload file to qu.ax (fallback telegraph)
 * @param {Buffer} buffer File buffer
 * @returns {Promise<string>} URL publique
 */

export async function uploadImage(buffer) {
    try {

        const tmpDir = path.join(process.cwd(), 'tmp');

        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
        }

        const fileType = await fileTypeFromBuffer(buffer);

        const {
            ext = 'png',
            mime = 'image/png'
        } = fileType || {};

        const tempFile = path.join(
            tmpDir,
            `temp_${Date.now()}.${ext}`
        );

        fs.writeFileSync(tempFile, buffer);

        // Upload qu.ax

        const form = new FormData();

        form.append(
            'files[]',
            fs.createReadStream(tempFile)
        );

        const response = await fetch(
            'https://qu.ax/upload.php',
            {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            }
        );

        fs.unlinkSync(tempFile);

        const result = await response.json();

        if (
            result?.success &&
            result.files?.[0]?.url
        ) {
            return result.files[0].url;
        }

        // Fallback telegraph

        const telegraphForm = new FormData();

        telegraphForm.append(
            'file',
            buffer,
            {
                filename: `upload.${ext}`,
                contentType: mime
            }
        );

        const telegraphResponse = await fetch(
            'https://telegra.ph/upload',
            {
                method: 'POST',
                body: telegraphForm
            }
        );

        const img = await telegraphResponse.json();

        if (img?.[0]?.src) {
            return 'https://telegra.ph' + img[0].src;
        }

        throw new Error(
            'Failed to upload image to both services'
        );

    } catch (err) {

        console.error(
            'Upload error:',
            err
        );

        throw err;

    }
}