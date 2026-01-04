import decodeJid from './decodeJid.js';
import config from '../config.js';

export default async function checkAdminOrOwner(sock, chatId, sender) {
  const isGroup = chatId.endsWith('@g.us');

  // 🔹 Normalisation sender
  const senderJid = decodeJid(sender);
  const senderNumber = senderJid.split('@')[0];

  // 🔹 Owners (normalisés)
  const ownerNumbers = (config.OWNERS || []).map(n => n.replace(/\D/g, ''));

  const isBotOwner = ownerNumbers.includes(senderNumber);

  // ================== HORS GROUPE ==================
  if (!isGroup) {
    return {
      isAdmin: false,
      isOwner: isBotOwner,
      isAdminOrOwner: isBotOwner,
      participant: null
    };
  }

  // ================== GROUP METADATA ==================
  let metadata;
  try {
    metadata = await sock.groupMetadata(chatId);
  } catch (e) {
    console.error('❌ groupMetadata error:', e);
    return {
      isAdmin: false,
      isOwner: isBotOwner,
      isAdminOrOwner: isBotOwner,
      participant: null
    };
  }

  // 🔹 Trouver participant
  const participant = metadata.participants.find(
    p => decodeJid(p.id) === senderJid
  );

  // ✅ ADMIN CHECK (Baileys correct)
  const isAdmin =
    participant?.admin === 'admin' ||
    participant?.admin === 'superadmin';

  // 🔹 Créateur du groupe
  const isGroupOwner =
    metadata.owner &&
    decodeJid(metadata.owner) === senderJid;

  const isOwner = isBotOwner || isGroupOwner;

  return {
    isAdmin,
    isOwner,
    isAdminOrOwner: isAdmin || isOwner,
    participant
  };
}