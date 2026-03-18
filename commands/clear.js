import chalk from 'chalk';

export async function clearCommand(sock, chatId) {
  try {
    // Envoyer un message temporaire pour informer
    const message = await sock.sendMessage(chatId, { text: '🧹 Clearing bot messages...' });
    
    // Supprimer ce message immédiatement après
    await sock.sendMessage(chatId, { delete: message.key });

  } catch (error) {
    console.error(chalk.red('❌ Error in clearCommand:'), error);
    await sock.sendMessage(chatId, { text: '❌ An error occurred while clearing messages.' });
  }
}