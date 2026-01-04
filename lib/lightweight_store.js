// ==================== lib/lightweight_store.js ====================
import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'baileys_store.json');

// Config : nombre max de messages par chat
const MAX_MESSAGES = 20;

const store = {
  messages: {},
  contacts: {},
  chats: {},

  readFromFile(filePath = STORE_FILE) {
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.contacts = data.contacts || {};
        this.chats = data.chats || {};
        this.messages = data.messages || {};
        this.cleanupData();
      }
    } catch (e) {
      console.warn('Failed to read store file:', e.message);
    }
  },

  writeToFile(filePath = STORE_FILE) {
    try {
      const data = JSON.stringify({
        contacts: this.contacts,
        chats: this.chats,
        messages: this.messages
      });
      fs.writeFileSync(filePath, data);
    } catch (e) {
      console.warn('Failed to write store file:', e.message);
    }
  },

  cleanupData() {
    if (this.messages) {
      Object.keys(this.messages).forEach(jid => {
        if (typeof this.messages[jid] === 'object' && !Array.isArray(this.messages[jid])) {
          const messages = Object.values(this.messages[jid]);
          this.messages[jid] = messages.slice(-MAX_MESSAGES);
        }
      });
    }
  },

  bind(ev) {
    ev.on('messages.upsert', ({ messages }) => {
      messages.forEach(msg => {
        if (!msg.key?.remoteJid) return;
        const jid = msg.key.remoteJid;
        this.messages[jid] = this.messages[jid] || [];
        this.messages[jid].push(msg);

        if (this.messages[jid].length > MAX_MESSAGES) {
          this.messages[jid] = this.messages[jid].slice(-MAX_MESSAGES);
        }
      });
    });

    ev.on('contacts.update', contacts => {
      contacts.forEach(contact => {
        if (contact.id) {
          this.contacts[contact.id] = {
            id: contact.id,
            name: contact.notify || contact.name || ''
          };
        }
      });
    });

    ev.on('chats.set', chats => {
      this.chats = {};
      chats.forEach(chat => {
        this.chats[chat.id] = { id: chat.id, subject: chat.subject || '' };
      });
    });
  },

  async loadMessage(jid, id) {
    return this.messages[jid]?.find(m => m.key.id === id) || null;
  },

  getStats() {
    let totalMessages = 0;
    let totalContacts = Object.keys(this.contacts).length;
    let totalChats = Object.keys(this.chats).length;

    Object.values(this.messages).forEach(chatMessages => {
      if (Array.isArray(chatMessages)) totalMessages += chatMessages.length;
    });

    return {
      messages: totalMessages,
      contacts: totalContacts,
      chats: totalChats,
      maxMessagesPerChat: MAX_MESSAGES
    };
  }
};

export default store;