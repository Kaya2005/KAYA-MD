import { BOT_NAME } from './botAssets.js';

export const styles = {
  1: { a: 0x1D41A, A: 0x1D400 },      // Bold Script
  2: { a: 0x1D44E, A: 0x1D434 },      // Italic Script
  3: { a: 0x1D482, A: 0x1D468 },      // Bold Italic Script
  4: { a: 0x1D4B6, A: 0x1D4AE },      // Fraktur
  5: { a: 0x1D4EA, A: 0x1D4D0 },      // Bold Fraktur
  6: { a: 0x1D51E, A: 0x1D504 },      // Double-Struck
  7: { a: 0x1D552, A: 0x1D538 },      // Bold Sans
  8: { a: 0x1D5EE, A: 0x1D5D4 },      // Italic Sans
  9: { a: 0x1D622, A: 0x1D608 },      // Bold Italic Sans
  10: { a: 0x1D656, A: 0x1D63C },     // Sans-Serif Script
  11: { a: 0x1D68A, A: 0x1D670 },     // Sans-Serif Bold Script
  12: { a: '𝖆'.charCodeAt(0) - 97, A: '𝕬'.charCodeAt(0) - 65 }, // Gothic
  13: { a: 'ⓐ'.charCodeAt(0) - 97, A: 'Ⓐ'.charCodeAt(0) - 65 }, // Circled
  14: { a: '🅰️'.charCodeAt(0) - 65, A: '🅰️'.charCodeAt(0) - 65 }, // Emoji A-Z
  15: { a: 0x1F130 - 0x41, A: 0x1F130 - 0x41 }, // Regional Indicator (🇦🇿)
  16: { a: 0x24D0 - 0x61, A: 0x24B6 - 0x41 },   // Enclosed Alphabets
  17: { a: 0xFF41 - 0x61, A: 0xFF21 - 0x41 },   // Fullwidth
  18: { a: 0x1D5BA - 0x61, A: 0x1D5A0 - 0x41 }, // Bold Fraktur Sans
  19: { a: 0x1D63A - 0x61, A: 0x1D622 - 0x41 }, // Italic Bold
  20: { a: 0x1D670 - 0x61, A: 0x1D64E - 0x41 }  // Double-Struck Italic
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
  for (let i = 1; i <= Object.keys(styles).length; i++) {
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
╔═━───────────────━═╗
   ${BOT_NAME} Fancy Text 
╚═━───────────────━═╝

📌 Utilisation :
  .fancy <style> <texte>

📎 Exemples :
  .fancy 01 KAYA
  .fancy 13 hacking

📑 Styles disponibles :
${stylesList}

══════════════════════════
`;
}