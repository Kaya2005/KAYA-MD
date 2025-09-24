// ==================== checkAdminOrOwner.js ====================
import decodeJid from './decodeJid.js';
import config from '../config.js';

export default async function checkAdminOrOwner(Kaya, chatId, sender, participants = [], metadata = null) {
  const isGroup = chatId.endsWith('@g.us');

  
  const ownerNumbers = config.OWNER_NUMBER.split(',')
    .map(o => o.trim().replace(/\D/g, '')); // nettoie les numéros
  const senderNumber = decodeJid(sender).split('@')[0].replace(/\D/g, '');
  const isBotOwner = ownerNumbers.includes(senderNumber);

 
  if (!isGroup) {
    return {
      isAdmin: false,
      isOwner: isBotOwner,
      isAdminOrOwner: isBotOwner,
      participant: null
    };
  }

  
  try {
    if (!metadata) metadata = await Kaya.groupMetadata(chatId);
    if (!participants || participants.length === 0) participants = metadata.participants || [];
  } catch (e) {
    console.error('❌ Impossible de récupérer groupMetadata:', e);
    return {
      isAdmin: false,
      isOwner: isBotOwner,
      isAdminOrOwner: isBotOwner,
      participant: null
    };
  }

  
  const participant = participants.find(p => {
    const jidToCheck = decodeJid(p.jid || p.id || '');
    return jidToCheck === decodeJid(sender);
  }) || null;

 
  const isAdmin = !!participant && (
    participant.admin === 'admin' ||
    participant.admin === 'superadmin' ||
    participant.role === 'admin' ||
    participant.role === 'superadmin' ||
    participant.isAdmin === true ||
    participant.isSuperAdmin === true
  );

  
  const isGroupOwner = metadata.owner && decodeJid(metadata.owner) === decodeJid(sender);

  
  const isOwnerUser = isBotOwner || isGroupOwner;

  return {
    isAdmin,
    isOwner: isOwnerUser,
    isAdminOrOwner: isAdmin || isOwnerUser,
    participant
  };
}