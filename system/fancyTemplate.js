import { BOT_NAME } from './botAssets.js';

export const styles = {
  1: { a: 0x1D41A, A: 0x1D400 },
  2: { a: 0x1D44E, A: 0x1D434 },
  3: { a: 0x1D482, A: 0x1D468 },
  4: { a: 0x1D4B6, A: 0x1D4AE },
  5: { a: 0x1D4EA, A: 0x1D4D0 },
  6: { a: 0x1D51E, A: 0x1D504 },
  7: { a: 0x1D552, A: 0x1D538 },
  8: { a: 0x1D5EE, A: 0x1D5D4 },
  9: { a: 0x1D622, A: 0x1D608 },
  10: { a: 0x1D656, A: 0x1D63C },
  11: { a: 0x1D68A, A: 0x1D670 },
  12: { a: '𝖆'.charCodeAt(0) - 97, A: '𝕬'.charCodeAt(0) - 65 },
  13: { a: 'ⓐ'.charCodeAt(0) - 97, A: 'Ⓐ'.charCodeAt(0) - 65 },
  14: { a: '🅰️'.charCodeAt(0) - 65, A: '🅰️'.charCodeAt(0) - 65 },
};

export function convertStyle(text, type) {
  const s = styles[type];
  if (!s) return text;

  return [...text].map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(s.A + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(s.a + (code - 97));
    return c;
  }).join('');
}

export function getStyleExamples(text = 'KAYA') {
  let stylesList = '';
  for (let i = 1; i <= 14; i++) {
    try {
      const styled = convertStyle(text, i);
      stylesList += `${i.toString().padStart(2, '0')} - ${styled}\n`;
    } catch {
      stylesList += `${i.toString().padStart(2, '0')} - (erreur)\n`;
    }
  }
  return stylesList;
}

export function buildFancyHelp() {
  const stylesList = getStyleExamples();
  return `
▉──『 ${BOT_NAME} 』──▉
┃ 🎨 Fancy Text Generator
┃
┃ 📌 Utilisation :
┃ .fancy <style> <texte>
┃
┃ 📎 Exemples :
┃ .fancy 1 KAYA
┃ .fancy 13 hacking
┃
┃ 📑 Styles disponibles :
${stylesList}
▉─────────────────▉
`.trim();
}