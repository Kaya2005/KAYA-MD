// ==================== commands/song.js ====================
import axios from 'axios';
import yts from 'yt-search';
import config from '../config.js';
import { BOT_NAME } from '../system/botAssets.js';

const AXIOS_DEFAULTS = {
	timeout: 30000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Accept': 'application/json, text/plain, */*'
	}
};

// Retry helper
async function tryRequest(getter, attempts = 3) {
	let lastError;
	for (let i = 1; i <= attempts; i++) {
		try {
			return await getter();
		} catch (err) {
			lastError = err;
			if (i < attempts) await new Promise(r => setTimeout(r, 1000 * i));
		}
	}
	throw lastError;
}

// Yupra API
async function getYupraDownloadByUrl(url) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(url)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.success && res?.data?.data?.download_url) {
		return {
			download: res.data.data.download_url,
			title: res.data.data.title,
			thumbnail: res.data.data.thumbnail
		};
	}
	throw new Error('Yupra API failed');
}

// Okatsu API (fallback)
async function getOkatsuDownloadByUrl(url) {
	const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(url)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
	if (res?.data?.dl) {
		return {
			download: res.data.dl,
			title: res.data.title,
			thumbnail: res.data.thumb
		};
	}
	throw new Error('Okatsu API failed');
}

// ==================== MAIN COMMAND ====================
export default {
	name: 'play',
	description: 'Download song from YouTube',
	category: 'Download',

	async execute(Kaya, m, args) {
		try {
			if (!args.length) {
				return Kaya.sendMessage(
					m.chat,
					{ text: `❌ Usage: \`.play <play name>\`\n\nby ${BOT_NAME}` },
					{ quoted: m }
				);
			}

			const query = args.join(' ');
			let video;

			// Search or direct link
			if (query.includes('youtube.com') || query.includes('youtu.be')) {
				video = { url: query, title: query };
			} else {
				const search = await yts(query);
				if (!search.videos.length) {
					return Kaya.sendMessage(
						m.chat,
						{ text: `❌ No results found.\n\nby ${BOT_NAME}` },
						{ quoted: m }
					);
				}
				video = search.videos[0];
			}

			// Info message
			await Kaya.sendMessage(
				m.chat,
				{
					image: { url: video.thumbnail },
					caption:
`🎵 *${video.title}*
⏱ ${video.timestamp || 'N/A'}

⏳ Downloading...

by ${BOT_NAME}`
				},
				{ quoted: m }
			);

			// Get download link (fast)
			let audioData;
			try {
				audioData = await getYupraDownloadByUrl(video.url);
			} catch {
				audioData = await getOkatsuDownloadByUrl(video.url);
			}

			// Send audio via URL (NO DELAY)
			await Kaya.sendMessage(
				m.chat,
				{
					audio: { url: audioData.download },
					mimetype: 'audio/mpeg',
					fileName: `${audioData.title || video.title}.mp3`
				},
				{ quoted: m }
			);

		} catch (err) {
			console.error('❌ SONG ERROR:', err);
			await Kaya.sendMessage(
				m.chat,
				{ text: `❌ Failed to download the song.\n\nby ${BOT_NAME}` },
				{ quoted: m }
			);
		}
	}
};