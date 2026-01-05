// ================= commands/song.js =================
import axios from 'axios'
import yts from 'yt-search'

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  },
}

// 🔁 Retry helper
async function tryRequest(getter, attempts = 3) {
  let lastError
  for (let i = 1; i <= attempts; i++) {
    try {
      return await getter()
    } catch (e) {
      lastError = e
      if (i < attempts) await new Promise(r => setTimeout(r, i * 1000))
    }
  }
  throw lastError
}

// 🎵 Izumi API (URL)
async function izumiByUrl(url) {
  const api = `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(url)}&format=mp3`
  const res = await tryRequest(() => axios.get(api, AXIOS_DEFAULTS))
  if (res?.data?.result?.download) return res.data.result
  throw new Error('Izumi URL failed')
}

// 🎵 Izumi API (Query)
async function izumiByQuery(query) {
  const api = `https://izumiiiiiiii.dpdns.org/downloader/youtube-play?query=${encodeURIComponent(query)}`
  const res = await tryRequest(() => axios.get(api, AXIOS_DEFAULTS))
  if (res?.data?.result?.download) return res.data.result
  throw new Error('Izumi Query failed')
}

// 🎵 Okatsu fallback
async function okatsu(url) {
  const api = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(url)}`
  const res = await tryRequest(() => axios.get(api, AXIOS_DEFAULTS))
  if (res?.data?.dl) {
    return {
      download: res.data.dl,
      title: res.data.title,
      thumbnail: res.data.thumb,
    }
  }
  throw new Error('Okatsu failed')
}

export default {
  name: 'play',
  description: '🎵 Download a YouTube song as MP3 (KAYA-MD)',
  category: 'Download',
  usage: '.play <song name or YouTube URL>',

  async execute(Kaya, m, args) {
    try {
      if (m.message?.imageMessage || m.message?.stickerMessage) return

      if (!args.length) {
        return Kaya.sendMessage(
          m.chat,
          { text: '❌ Usage: `.play <song name or YouTube URL>`' },
          { quoted: m }
        )
      }

      const query = args.join(' ')
      let video

      // 🔎 Search or direct URL
      if (/youtube\.com|youtu\.be/.test(query)) {
        video = { url: query }
      } else {
        const search = await yts(query)
        if (!search.videos.length) {
          return Kaya.sendMessage(m.chat, { text: '❌ No results found.' }, { quoted: m })
        }
        video = search.videos[0]
      }

      // 📢 Sending video info
      const infoText = `
╭━━〔 🎵 KAYA-MD MUSIC 〕━━⬣
┃ 🎬 Title  : ${video.title}
┃ ⏱ Duration : ${video.timestamp}
┃ 📍 URL    : ${video.url}
╰━━━━━━━━━━━━━━━━━━⬣
      `.trim()

      await Kaya.sendMessage(
        m.chat,
        {
          image: { url: video.thumbnail },
          caption: infoText,
        },
        { quoted: m }
      )

      // ⬇️ Download audio with fallback
      let audio
      try {
        audio = await izumiByUrl(video.url)
      } catch {
        try {
          audio = await izumiByQuery(video.title || query)
        } catch {
          audio = await okatsu(video.url)
        }
      }

      // 🎧 Send audio
      await Kaya.sendMessage(
        m.chat,
        {
          audio: { url: audio.download },
          mimetype: 'audio/mpeg',
          fileName: `${(audio.title || video.title || 'song')}.mp3`,
          caption: '✅ Downloaded successfully with KAYA-MD 🎵',
        },
        { quoted: m }
      )

    } catch (err) {
      console.error('❌ Play command error:', err)
      await Kaya.sendMessage(
        m.chat,
        { text: '❌ Failed to download the song. Please try again later. (KAYA-MD)' },
        { quoted: m }
      )
    }
  },
}