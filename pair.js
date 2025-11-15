import express from "express";
import fs from "fs-extra";
import { exec } from "child_process";
import pino from "pino";
import { Boom } from "@hapi/boom";
import crypto from "crypto";
import { upload } from "./mega.js";
import {
  makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers,
  DisconnectReason
} from "@whiskeysockets/baileys";

const router = express.Router();

const MESSAGE = process.env.MESSAGE || `
*SESSION_ID KAYA-MD*

📌 Copie le Session ID ci-dessus et colle-le dans ton fichier config.js.
`;

// 🧹 On nettoie le dossier
if (fs.existsSync("./auth_info_baileys")) {
  await fs.emptyDir("./auth_info_baileys");
}

router.get("/", async (req, res) => {
  let num = req.query.number;

  if (!num) return res.status(400).json({ error: "Le paramètre 'number' est requis." });

  num = num.replace(/\D/g, "");
  if (num.length < 8) return res.status(400).json({ error: "Numéro invalide." });

  async function createSession() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys");

    try {
      const client = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Safari"),
      });

      client.ev.on("creds.update", saveCreds);

      // ░░░ 1. SI PAS CONNECTÉ → On génère un pairing code ░░░
      if (!state.creds.registered) {
        try {
          const pairingCode = await client.requestPairingCode(num);

          if (!res.headersSent) {
            res.json({ code: pairingCode });
          }

          return; // IMPORTANT !
        } catch (e) {
          return res.json({ error: "WhatsApp bloque le pairing. Réessaye." });
        }
      }

      // ░░░ 2. SI CONNECTÉ → on génère la session comme avant ░░░
      client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
          try {
            await delay(3000);

            const authPath = "./auth_info_baileys/";
            const user = client.user.id;

            const randomMegaId = (len = 6, numLen = 4) => {
              const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
              let str = "";
              for (let i = 0; i < len; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
              const num = Math.floor(Math.random() * 10 ** numLen);
              return `${str}${num}`;
            };

            // Upload des credentials
            const mega_url = await upload(
              fs.createReadStream(authPath + "creds.json"),
              `${randomMegaId()}.json`
            );

            let fileID, key;
            if (mega_url.includes("#")) {
              const parts = mega_url.split("/file/")[1].split("#");
              fileID = parts[0];
              key = parts[1];
            } else {
              fileID = mega_url.split("/file/")[1];
              key = crypto.randomBytes(32).toString("base64");
            }

            const sessionID = `kaya~${fileID}#${key}`;

            const msg = await client.sendMessage(user, { text: sessionID });
            await client.sendMessage(user, { text: MESSAGE }, { quoted: msg });

            await fs.emptyDir(authPath);
            console.log("✅ Session envoyée !");
          } catch (err) {
            console.error("Erreur upload :", err.message);
          }
        }

        if (connection === "close") {
          const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

          if (
            [
              DisconnectReason.connectionClosed,
              DisconnectReason.connectionLost,
              DisconnectReason.restartRequired,
              DisconnectReason.timedOut,
            ].includes(reason)
          ) {
            createSession().catch(console.error);
          } else {
            await delay(2000);
            exec("pm2 restart qasim");
          }
        }
      });
    } catch (err) {
      await fs.emptyDir("./auth_info_baileys");
      if (!res.headersSent) res.json({ code: "Erreur interne. Réessaie." });
    }
  }

  await createSession();
});

export default router;