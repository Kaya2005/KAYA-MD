import { convertStyle, buildFancyHelp } from '../system/fancyTemplate.js';

export default {
  name: 'fancy',
  description: '🎨 Transforme le texte avec un style fancy. Usage: .fancy <style> <texte>',
  category: 'General',

  run: async (kaya, m, args) => {
    if (args.length < 2 || isNaN(args[0])) {
      return kaya.sendMessage(m.chat, { text: buildFancyHelp() }, { quoted: m });
    }

    const style = parseInt(args[0]);
    const content = args.slice(1).join(' ');
    const fancyText = convertStyle(content, style);

    return kaya.sendMessage(m.chat, { text: fancyText }, { quoted: m });
  }
};