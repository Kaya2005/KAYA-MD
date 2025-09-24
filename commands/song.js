// ==================== commands/song.js ====================
import fetch from 'node-fetch';
import { contextInfo } from '../utils/contextInfo.js';

export default {
  name: 'song',
  description: 'Télécharge une chanson depuis YouTube 🎵 (vreden & diioffc)',
  category: 'Musique',

  run: async (kaya, m, msg, store, args) => {
    const text = args.join(' ');
    if (!text) return kaya.sendMessage(m.chat, { text: '❌ Titre manquant.', contextInfo }, { quoted: m });

    try {
      // 🔹 Essaye API principale (vreden.my.id)
      await kaya.sendMessage(m.chat, { text: '🔍 Recherche sur la source principale...', contextInfo }, { quoted: m });

      const vredenRes = await fetch(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(text)}`);
      const vredenData = await vredenRes.json();

      if (vredenData.result?.download?.url) {
        const { metadata, download } = vredenData.result;

        await kaya.sendMessage(m.chat, {
          audio: { url: download.url },
          mimetype: 'audio/mpeg',
          fileName: download.filename,
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: metadata.title.slice(0, 60),
              body: `${metadata.author?.name || 'Unknown'} • ${metadata.duration?.timestamp || '0:00'}`,
              thumbnailUrl: metadata.thumbnail,
              mediaUrl: metadata.url,
              mediaType: 2,
              sourceUrl: metadata.url
            }
          }
        }, { quoted: m });

        return;
      }

      // 🔹 Si principale échoue, API alternative (diioffc.web.id)
      await kaya.sendMessage(m.chat, { text: '⚡ Essai d’une source alternative...', contextInfo }, { quoted: m });

      const diioffcRes = await fetch(`https://api.diioffc.web.id/api/search/ytplay?query=${encodeURIComponent(text)}`);
      const diioffcData = await diioffcRes.json();

      if (diioffcData.status && diioffcData.result?.download?.url) {
        const { title, author, duration, thumbnail, url, download } = diioffcData.result;

        await kaya.sendMessage(m.chat, {
          audio: { url: download.url },
          mimetype: 'audio/mpeg',
          fileName: download.filename || `${title}.mp3`,
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title: title.slice(0, 60),
              body: `${author?.name || 'Unknown'} • ${duration?.timestamp || '0:00'}`,
              thumbnailUrl: thumbnail,
              mediaUrl: url,
              mediaType: 2,
              sourceUrl: url
            }
          }
        }, { quoted: m });

        return;
      }

      throw new Error('Aucune chanson trouvée sur les sources disponibles.');

    } catch (err) {
      console.error('Erreur commande song:', err);
      await kaya.sendMessage(m.chat, { text: '❌ Impossible de récupérer la chanson.\n' + (err.message || err), contextInfo }, { quoted: m });
    }
  }
};