// system/contextInfo.js

const newsletters = [
  {
    jid: '120363410993553528@newsletter',
    name: '𝐊𝐀𝐘𝐀 𝐁𝐎𝐓'
  },
  {
    jid: '120363407597019818@newsletter',
    name: '𝐊𝐀𝐘𝐀 𝐁𝐎𝐓'
  }
];

export function getContextInfo() {
  const newsletter =
    newsletters[Math.floor(Math.random() * newsletters.length)];

  return {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: newsletter.jid,
      newsletterName: newsletter.name,
      serverMessageId: 150
    }
  };
}