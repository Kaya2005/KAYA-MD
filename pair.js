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
*SESSION GENERATED SUCCESSFULLY* ✅

*Gɪᴠᴇ ᴀ ꜱᴛᴀʀ ᴛᴏ ʀᴇᴘᴏ ꜰᴏʀ ᴄᴏᴜʀᴀɢᴇ* 🌟
https://github.com/GlobalTechInfo/MEGA-MD

*Sᴜᴘᴘᴏʀᴛ Gʀᴏᴜᴘ ꜰᴏʀ ϙᴜᴇʀʏ* 💭
https://t.me/Global_TechInfo
https://whatsapp.com/channel/0029VagJIAr3bbVBCpEkAM07

*Yᴏᴜ-ᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* 🪄 
https://youtube.com/@GlobalTechInfo

*MEGA-MD--WHATSAPP* 🥀
`;

async function removeFile(path) {
    if (fs.existsSync(path)) await fs.remove(path);
}

function randomMegaId(len = 6, numLen = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    const number = Math.floor(Math.pow(10, numLen) * Math.random());
    return `${out}${number}`;
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    const dirs = './auth_info_baileys';

    if (!num) {
        return res.status(400).send({ code: 'Phone number is required' });
    }

    await removeFile(dirs);

    num = num.replace(/[^0-9]/g, '');
    const phone = pn('+' + num);

    if (!phone.isValid()) {
        return res.status(400).send({
            code: 'Invalid phone number. Use full international format.'
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

            let sessionSent = false;

            // ✅ BON ENDROIT POUR ENVOYER LA SESSION
            sock.ev.on('creds.update', async () => {
                if (sessionSent) return;

                const credsFile = `${dirs}/creds.json`;
                if (!fs.existsSync(credsFile)) return;
                if (!sock.authState.creds.registered) return;

                sessionSent = true;

                try {
                    const id = randomMegaId();
                    const megaLink = await megaUpload(
                        fs.createReadStream(credsFile),
                        `${id}.json`
                    );

                    // 🔑 Transformation MEGA LINK -> SESSION_ID "kaya~FILEID#KEY"
                    const match = megaLink.match(/file\/([^#]+)#(.+)/);
                    if (!match) throw new Error('Invalid MEGA link');
                    const fileId = match[1];
                    const key = match[2];
                    const sessionId = `kaya~${fileId}#${key}`;

                    const userJid = jidNormalizedUser(`${num}@s.whatsapp.net`);

                    const m1 = await sock.sendMessage(userJid, { text: sessionId });
                    await sock.sendMessage(userJid, { text: MESSAGE, quoted: m1 });

                    await delay(800);
                    await removeFile(dirs);

                } catch (err) {
                    console.error('SESSION ERROR:', err);
                    await removeFile(dirs);
                }
            });

            // Pairing code
            if (!sock.authState.creds.registered) {
                await delay(1500);
                try {
                    let code = await sock.requestPairingCode(num);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    if (!res.headersSent) res.send({ code });
                } catch {
                    if (!res.headersSent) {
                        res.status(503).send({ code: 'Failed to get pairing code' });
                    }
                }
            }

            sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    if (statusCode === 401) {
                        removeFile(dirs);
                    } else {
                        runSession();
                    }
                }
            });

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