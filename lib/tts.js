import querystring from 'querystring';

export function getAudioUrl(text, options = {}) {
  const { lang = 'fr' } = options;

  const query = querystring.stringify({
    text,
    voice: lang === 'fr' ? 'fr-FR-Wavenet-D' : 'en-US-Wavenet-D'
  });

  return `https://api.streamelements.com/kappa/v2/speech?${query}`;
}