// ================== commands/fb.js ==================
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
    name: 'facebook',
    alias: ['fb'],
    description: 'Download Facebook videos',
    category: 'Download',
    ownerOnly: false,
    usage: '.fb <Facebook video URL>',

    run: async (kaya, m, args) => {
        try {
            const chatId = m.chat;
            const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
            const url = args.join(' ').trim();

            if (!url) {
                return kaya.sendMessage(chatId, {
                    text: "❌ Please provide a Facebook video URL.\nExample: .fb https://www.facebook.com/..."
                }, { quoted: m });
            }

            // Send loading reaction
            await kaya.sendMessage(chatId, {
                react: { text: '🔄', key: m.key }
            });

            // Resolve URL if needed
            let resolvedUrl = url;
            try {
                const res = await axios.get(url, { timeout: 15000, maxRedirects: 5, headers: { 'User-Agent': 'Mozilla/5.0' } });
                resolvedUrl = res?.request?.res?.responseUrl || url;
            } catch {}

            // Fetch video from Hanggts API
            async function fetchFbVideo(videoUrl) {
                const apiUrl = `https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(videoUrl)}`;
                const res = await axios.get(apiUrl, { timeout: 20000 });
                if (!res.data) throw new Error('No data from API');
                return res.data;
            }

            let apiData;
            try {
                apiData = await fetchFbVideo(resolvedUrl);
            } catch {
                apiData = await fetchFbVideo(url);
            }

            // Extract video URL and title from API response
            let videoUrl = null;
            let title = "Facebook Video";

            if (apiData.result?.media) {
                videoUrl = apiData.result.media.video_hd || apiData.result.media.video_sd;
                title = apiData.result.info?.title || apiData.result.title || title;
            } else if (apiData.result?.url) {
                videoUrl = apiData.result.url;
                title = apiData.result.title || title;
            } else if (apiData.download) {
                videoUrl = apiData.download;
                title = apiData.title || title;
            }

            if (!videoUrl) {
                return kaya.sendMessage(chatId, {
                    text: '❌ Failed to retrieve the Facebook video.\n• Video may be private or deleted\n• URL may be invalid'
                }, { quoted: m });
            }

            // Try sending directly by URL first
            try {
                await kaya.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: `✅ Downloaded by KAYA-MD\n📝 Title: ${title}`
                }, { quoted: m });
                return;
            } catch {}

            // Fallback: download video to temp file then send
            try {
                const tmpDir = path.join(process.cwd(), 'tmp');
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

                const tempFile = path.join(tmpDir, `fb_${Date.now()}.mp4`);
                const response = await axios.get(videoUrl, { responseType: 'stream', timeout: 60000 });
                const writer = fs.createWriteStream(tempFile);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) throw new Error('Failed to download video');

                await kaya.sendMessage(chatId, {
                    video: { url: tempFile },
                    mimetype: "video/mp4",
                    caption: `✅ Downloaded by KAYA MD\n📝 Title: ${title}`
                }, { quoted: m });

                fs.unlinkSync(tempFile);
                return;
            } catch (err) {
                console.error('Fallback download error:', err);
                return kaya.sendMessage(chatId, {
                    text: '❌ Failed to send the video. Please try again later.'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('[FB COMMAND ERROR]', error);
            await kaya.sendMessage(m.chat, {
                text: `❌ An error occurred while downloading the video.\n${error.message}`
            }, { quoted: m });
        }
    }
};