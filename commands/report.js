import { formatUptime } from '../system/utils.js';

export default {
  name: 'report',
  alias: ['stats', 'analysis', 'whats'],
  category: 'Owner',
  description: 'Detailed analysis of your WhatsApp via the bot (Owner only)',
  usage: '.report',
  ownerOnly: true, 

  run: async (sock, m, args) => {
    try {
      const uptime = formatUptime(Date.now() - global.botStartTime);

      // 🔹 Get all chats accessible by the bot
      const chats = await sock.chats.all();
      const totalChats = chats.length;

      // 🔹 Separate groups and private chats
      const groups = chats.filter(c => c.jid.endsWith('@g.us'));
      const privates = chats.filter(c => !c.jid.endsWith('@g.us'));

      // 🔹 Number of contacts known by the bot
      const contacts = Object.keys(global.db.data?.users || {}).length;

      // 🔹 Message statistics per chat (if stored in db)
      const chatStats = chats.map(chat => {
        const jid = chat.jid;
        const messages = global.db.data?.chats?.[jid]?.messages || [];
        return {
          jid,
          name: chat.name || chat.jid.split('@')[0],
          count: messages.length
        };
      });

      // 🔹 Top 5 most active groups
      const topGroups = chatStats
        .filter(c => c.jid.endsWith('@g.us'))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(c => `• ${c.name} : ${c.count} msgs`)
        .join('\n');

      // 🔹 Top 5 most active private contacts
      const topPrivates = chatStats
        .filter(c => !c.jid.endsWith('@g.us'))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(c => `• ${c.name} : ${c.count} msgs`)
        .join('\n');

      // 🔹 Final message
      const message = `
📊 *WhatsApp Detailed Report*

*⏱️ Bot Uptime:* ${uptime}
*👥 Total Accessible Chats:* ${totalChats}
   • Groups : ${groups.length}
   • Private : ${privates.length}
*📇 Contacts Known by the Bot:* ${contacts}

*🔥 Top 5 Most Active Groups:*
${topGroups || 'No active groups.'}

*💌 Top 5 Most Active Private Contacts:*
${topPrivates || 'No active contacts.'}

*💡 Note:* This report only reflects data accessible by the bot.
`;

      await sock.sendMessage(m.chat, { text: message }, { quoted: m });

    } catch (err) {
      console.error('❌ Report error:', err);
      await sock.sendMessage(
        m.chat,
        { text: '❌ Unable to generate WhatsApp report.' },
        { quoted: m }
      );
    }
  }
};