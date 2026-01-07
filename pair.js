import express from 'express';
import fs from 'fs-extra';
import pino from 'pino';
import pn from 'awesome-phonenumber';
import { exec } from 'child_process';
import {
    makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { upload as megaUpload } from './mega.js';

const router = express.Router();

const MESSAGE = `
╭───────❖ KAYA-BOT ❖────────⬣
│ ✅ SESSION_ID générée avec succès !
│
│ 🚀 Déployez votre bot gratuitement sur Katapump :
│ 🔗 https://dashboard.katabump.com/auth/login#483bf6
│
│ 💬 Group WhatsApp:
│ 🔗 https://chat.whatsapp.com/H938qt5NiZ3HrBjVgxiMKH
╰──────────────────────────⬣
`;

async function removeFile(path) {
    if (fs.existsSync(path)) await fs.remove(path);
}

function randomMegaId(len = 6, numLen = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    const number = Math.floor(Math.random() * Math.pow(10, numLen));
    return `${out}${number}`;
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    const dirs = './auth_info_baileys';

    await removeFile(dirs);

    num = num.replace(/[^0-9]/g, '');
    const phone = pn('+' + num);

    if (!phone.isValid()) {
        return res.status(400).send({
            code: 'Invalid phone number. Use full international format without + or spaces.'
        });
    }

    num = phone.getNumber('e164').replace('+', '');

    async function runSession() {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(dirs);
            const { version } = await fetchLatestBaileysVersion();

            const sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'fatal' })
                    )
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }),
                browser: Browsers.windows('Chrome'),
                markOnlineOnConnect: false
            });

            sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {

                if (connection === 'open') {

                    // ⏳ Sécurité : attendre que creds.json soit bien écrit
                    await delay(1500);

                    const credsFile = `${dirs}/creds.json`;
                    if (!fs.existsSync(credsFile)) return;

                    try {
                        const id = randomMegaId();
                        const megaLink = await megaUpload(
                            fs.createReadStream(credsFile),
                            `${id}.json`
                        );

                        // ✅ FIX MEGA (tous formats)
                        let sessionId;
                        if (megaLink.includes('mega.nz')) {
                            sessionId = 'kaya~' + megaLink.split('https://mega.nz/')[1];
                        } else {
                            throw new Error('Lien Mega invalide');
                        }

                        const userJid = jidNormalizedUser(num + '@s.whatsapp.net');

                        const m1 = await sock.sendMessage(userJid, { text: sessionId });
                        await sock.sendMessage(userJid, { text: MESSAGE, quoted: m1 });

                        // ⏳ délai sûr avant suppression
                        await delay(3000);
                        await removeFile(dirs);

                    } catch (err) {
                        console.error('Error sending Mega link:', err);
                        await removeFile(dirs);
                    }
                }

                if (connection === 'close') {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    if (code === 401) {
                        console.log('Logged out');
                        await removeFile(dirs);
                    } else {
                        console.log('Restarting session...');
                        runSession();
                    }
                }
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                try {
                    let code = await sock.requestPairingCode(num);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    if (!res.headersSent) res.send({ code });
                } catch (err) {
                    if (!res.headersSent) {
                        res.status(503).send({ code: 'Failed to get pairing code' });
                    }
                }
            }

            sock.ev.on('creds.update', saveCreds);

        } catch (err) {
            console.error('Fatal error:', err);
            await removeFile(dirs);
            exec('pm2 restart qasim');
            if (!res.headersSent) {
                res.status(503).send({ code: 'Service Unavailable' });
            }
        }
    }

    await runSession();
});

process.on('uncaughtException', err => {
    const e = String(err);
    const ignore = [
        'conflict',
        'not-authorized',
        'Socket connection timeout',
        'rate-overlimit',
        'Connection Closed',
        'Timed Out',
        'Value not found',
        'Stream Errored',
        'statusCode: 515',
        'statusCode: 503'
    ];
    if (!ignore.some(x => e.includes(x))) {
        console.log('Caught exception:', err);
        exec('pm2 restart qasim');
    }
});

export default router;