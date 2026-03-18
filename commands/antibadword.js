import fs from 'fs';
import path from 'path';

const dataPath = './data/antibadword.json';
const badWords = [
  'fuck', 'bitch', 'asshole', 'nigga', 'shit',
  'merde', 'connard', 'salaud', 'putain', 'enfoiré'
];

// Charger data
function loadData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath));
}

// Sauvegarder data
function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Messages FR/EN
function getMessage(key, sender, lang = 'en') {
  const msgs = {
    notGroup: { fr: '❌ Commande réservée aux groupes', en: '❌ Group only command' },
    notAdmin: { fr: '❌ Seulement pour les admins', en: '❌ Admins only' },
    menu: { 
      fr: '📛 *MENU ANTIBADWORD*\n.antibadword on\n.antibadword off\n.antibadword set delete|kick|warn',
      en: '📛 *ANTIBADWORD MENU*\n.antibadword on\n.antibadword off\n.antibadword set delete|kick|warn'
    },
    enabled: { fr: '✅ AntiBadword activé', en: '✅ AntiBadword enabled' },
    disabled: { fr: '❌ AntiBadword désactivé', en: '❌ AntiBadword disabled' },
    setAction: (action) => ({ fr: `✅ Action définie sur *${action}*`, en: `✅ Action set to *${action}*` }),
    badWords: (sender) => ({ fr: `⚠️ @${sender.split('@')[0]} mots interdits ici`, en: `⚠️ @${sender.split('@')[0]} bad words not allowed` }),
    warning: (sender, n) => ({ fr: `⚠️ @${sender.split('@')[0]} avertissement ${n}/3`, en: `⚠️ @${sender.split('@')[0]} warning ${n}/3` })
  };
  return typeof msgs[key] === 'function' ? msgs[key](sender) : msgs[key][lang] || msgs[key].en;
}

export default {
  name: 'antibadword',
  description: 'Active/configure AntiBadword (FR/EN)',
  category: 'Groupe',

  run: async (kaya, m, args, lang = 'en') => {
    try {
      if (!m.isGroup) return kaya.sendMessage(m.chat, { text: getMessage('notGroup', null, lang) }, { quoted: m });

      const sender = m.sender;
      const metadata = await kaya.groupMetadata(m.chat);
      const admins = metadata.participants.filter(p => p.admin).map(p => p.id);

      if (!admins.includes(sender)) return kaya.sendMessage(m.chat, { text: getMessage('notAdmin', null, lang) }, { quoted: m });

      const data = loadData();
      data[m.chat] ??= { enabled: false, action: 'delete', warnings: {} };

      const option = args[0];

      if (!option) {
        return kaya.sendMessage(m.chat, { text: getMessage('menu', null, lang) }, { quoted: m });
      }

      // ON / OFF
      if (option === 'on') {
        data[m.chat].enabled = true;
        saveData(data);
        return kaya.sendMessage(m.chat, { text: getMessage('enabled', null, lang) }, { quoted: m });
      }
      if (option === 'off') {
        data[m.chat].enabled = false;
        saveData(data);
        return kaya.sendMessage(m.chat, { text: getMessage('disabled', null, lang) }, { quoted: m });
      }

      // SET ACTION
      if (option === 'set') {
        const action = args[1];
        if (!['delete', 'kick', 'warn'].includes(action)) {
          return kaya.sendMessage(m.chat, { text: '❌ Choisissez: delete | kick | warn / Choose: delete | kick | warn' }, { quoted: m });
        }
        data[m.chat].action = action;
        saveData(data);
        return kaya.sendMessage(m.chat, { text: getMessage('setAction', action, lang) }, { quoted: m });
      }

    } catch (err) {
      console.error('❌ Error antibadword:', err);
      await kaya.sendMessage(m.chat, { text: '❌ Error processing antibadword command' }, { quoted: m });
    }
  },

  // ---------------------- BADWORD DETECTION ----------------------
  detect: async (kaya, m, lang = 'en') => {
    try {
      if (!m.isGroup || !m.body) return;

      const data = loadData();
      const group = data[m.chat];
      if (!group?.enabled) return;

      const text = m.body.toLowerCase();
      const found = badWords.some(w => text.includes(w));
      if (!found) return;

      const sender = m.sender;

      // Supprimer le message
      await kaya.sendMessage(m.chat, { delete: m.key });

      // Prendre action
      if (group.action === 'delete') {
        await kaya.sendMessage(m.chat, { text: getMessage('badWords', sender, lang), mentions: [sender] });
      }

      if (group.action === 'kick') {
        await kaya.groupParticipantsUpdate(m.chat, [sender], 'remove');
      }

      if (group.action === 'warn') {
        group.warnings[sender] ??= 0;
        group.warnings[sender]++;
        if (group.warnings[sender] >= 3) {
          await kaya.groupParticipantsUpdate(m.chat, [sender], 'remove');
          group.warnings[sender] = 0;
        } else {
          await kaya.sendMessage(m.chat, { text: getMessage('warning', sender, lang), mentions: [sender] });
        }
        saveData(data);
      }

    } catch (e) {
      console.error('❌ Badword detection error:', e);
    }
  }
};