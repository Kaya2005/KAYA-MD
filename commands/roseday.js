import fetch from 'node-fetch';

export async function rosedayCommand(sock, chatId, message) {
  try {
    const API_KEY = 'prince';
    const res = await fetch(`https://api.princetechn.com/api/fun/roseday?apikey=${API_KEY}`);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API responded with status ${res.status}: ${errText}`);
    }

    const json = await res.json();

    if (!json?.result) {
      throw new Error('API response does not contain result field.');
    }

    const rosedayMessage = `🌹 *Rose Day Message:*\n\n${json.result}`;

    await sock.sendMessage(chatId, { text: rosedayMessage }, { quoted: message });
  } catch (error) {
    console.error('❌ Error in rosedayCommand:', error);
    await sock.sendMessage(
      chatId, 
      { text: '❌ Failed to fetch Rose Day quote. Please try again later!' }, 
      { quoted: message }
    );
  }
}