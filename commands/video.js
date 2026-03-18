// ==================== commands/video.js ====================
import axios from 'axios';
import yts from 'yt-search';
import config from '../config.js';
import { BOT_NAME } from '../system/botAssets.js';

const AXIOS_DEFAULTS = {
	timeout: 60000,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

// ================= APIs =================

// Yupra
async function getYupraVideoByUrl(url) {
	const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`;
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

// Okatsu
async function getOkatsuVideoByUrl(url) {
	const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(url)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));

	if (res?.data?.result?.mp4) {
		return {
			download: res.data.result.mp4,
			title: res.data.result.title
		};
	}
	throw new Error('Okatsu API failed');
}

// Widipe (🔥 backup solide)
async function getWidipeVideo(url) {
	const apiUrl = `https://widipe.com/api/download/ytmp4?url=${encodeURIComponent(url)}`;
	const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));

	if (res?.data?.result?.url) {
		return {
			download: res.data.result.url,
			title: res.data.result.title
		};
	}
	throw new Error('Widipe API failed');
}

// ==================== MAIN COMMAND ====================
export default {
	name: 'video',
	description: 'Download YouTube video',
	category: 'Download',

	async execute(Kaya, m, args) {
		try {
			if (!args.length) {
				return Kaya.sendMessage(
					m.chat,
					{ text: `❌ Usage: \`.video <video name or YouTube link>\`\n\nby ${BOT_NAME}` },
					{ quoted: m }
				);
			}

			const query = args.join(' ');
			let video;

			// Direct link or search
			if (query.includes('youtube.com') || query.includes('youtu.be')) {
				video = { url: query, title: query };
			} else {
				const search = await yts(query);
				if (!search.videos.length) {
					return Kaya.sendMessage(
						m.chat,
						{ text: `❌ No videos found.\n\nby ${BOT_NAME}` },
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
`🎬 *${video.title}*
⏱ ${video.timestamp || 'N/A'}

⏳ Downloading video...

by ${BOT_NAME}`
				},
				{ quoted: m }
			);

			// ================= DOWNLOAD =================
			let videoData;

			try {
				videoData = await getYupraVideoByUrl(video.url);
			} catch {
				try {
					videoData = await getOkatsuVideoByUrl(video.url);
				} catch {
					videoData = await getWidipeVideo(video.url);
				}
			}

			if (!videoData?.download) {
				throw new Error('No download link');
			}

			// ================= SEND =================
			await Kaya.sendMessage(
				m.chat,
				{
					video: { url: videoData.download },
					mimetype: 'video/mp4',
					fileName: `${videoData.title || video.title}.mp4`,
					caption: `🎬 *${videoData.title || video.title}*\n\nby ${BOT_NAME}`
				},
				{ quoted: m }
			);

		} catch (err) {
			console.error('❌ VIDEO ERROR:', err);

			await Kaya.sendMessage(
				m.chat,
				{ 
					text: `❌ Failed to download video.\n\n🔗 Try this link:\n${args.join(' ')}\n\nby ${BOT_NAME}` 
				},
				{ quoted: m }
			);
		}
	}
};