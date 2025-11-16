// pair.js - remplace complètement ton fichier actuel
import express from "express";
import fs from "fs-extra";
import pino from "pino";
import { exec } from "child_process";
import crypto from "crypto";
import { Boom } from "@hapi/boom";
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

// cooldown par IP
const cooldown = new Map();

// sockets par numéro
const sockets = new Map(); // num -> { sock, state, saveCreds, pairing: boolean, listenersInstalled: boolean }

const MESSAGE = `
*SESSION_ID KAYA-MD*

📌 Copie le *Session ID* ci-dessus et colle-le dans ton fichier config.js.
`;

// helper pour auth dir par numéro
function authDirFor(num) {
  // safe folder name
  const safe = num.replace(/\D/g, "");
  return `./auth_info_${safe}`;
}

// small helper to generate mega id
function randomMegaId(len = 6, numLen = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let str = "";
  for (let i = 0; i < len; i++) str += chars.charAt(Math.floor(Math.random() * chars.length));
  const num = Math.floor(Math.random() * 10 ** numLen);
  return `${str}${num}`;
}

router.get("/", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress;

    // Anti-spam 30s
    if (cooldown.has(ip)) {
      const last = cooldown.get(ip);
      const diff = (Date.now() - last) / 1000;
      if (diff < 30) {
        return res.status(429).json({ error: `Attends ${Math.ceil(30 - diff)} secondes avant de redemander un code.` });
      }
    }
    cooldown.set(ip, Date.now());

    let num = req.query.number;
    if (!num) return res.status(400).json({ error: "Paramètre 'number' requis." });

    num = num.replace(/\D/g, "");
    if (num.length < 8) return res.status(400).json({ error: "Numéro invalide." });

    const authDir = authDirFor(num);

    // create auth dir if absent
    if (!fs.existsSync(authDir)) {
      await fs.mkdir(authDir, { recursive: true });
    }

    // If there's an existing socket record, reuse it
    let entry = sockets.get(num);

    if (!entry) {
      // initialize state once and store
      const stateObj = await useMultiFileAuthState(authDir);
      const { state, saveCreds } = stateObj;

      // create socket but don't remove folder anywhere
      const sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Safari"),
      });

      // persist entry
      entry = {
        sock,
        state,
        saveCreds,
        pairing: false,
        oneTimeListenerAttached: false
      };

      // attach creds.update to save
      sock.ev.on("creds.update", saveCreds);

      // listen to connection.update to keep socket metadata up to date
      sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        // keep pairing flag accurate: if socket closes while pairing, keep pairing = true until next create
        if (connection === "open") {
          // nothing here, open handler will be installed as one-time below
        }
        if (connection === "close") {
          // leave entry as is; we'll remove it after one-time listener does cleanup
        }
      });

      sockets.set(num, entry);
    }

    const { sock, state, saveCreds } = entry;

    // If not registered, request pairing code and return it IMMEDIATELY
    if (!state.creds.registered) {
      // avoid concurrent pair attempts for same number
      if (entry.pairing) {
        return res.status(429).json({ error: "Pairing déjà en cours pour ce numéro. Attends un instant." });
      }

      entry.pairing = true;

      // attach a one-time connection.open listener to handle upload & cleanup
      const onConnectionUpdate = async (update) => {
        try {
          const { connection, lastDisconnect } = update;

          if (connection === "open") {
            // connection succeeded — proceed with upload/send
            try {
              await delay(2000); // short wait to ensure creds.json written

              const user = sock.user?.id;
              const authPath = authDir;

              if (!user) {
                console.error("Pas de user.id après connection.open pour", num);
              } else {
                // perform upload
                const mega_url = await upload(
                  fs.createReadStream(authPath + "/creds.json"),
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

                const msg = await sock.sendMessage(user, { text: sessionID });
                await sock.sendMessage(user, { text: MESSAGE }, { quoted: msg });

                // cleanup auth dir AFTER upload & send
                try {
                  await fs.emptyDir(authPath);
                } catch (e) {
                  console.warn("Could not clean auth dir:", e.message || e);
                }

                console.log("Session sent for", num);
              }
            } catch (e) {
              console.error("Upload/send error for", num, e.message || e);
            } finally {
              // teardown: close socket & remove map entry to allow fresh next time
              try { sock.end(); } catch(e){/*ignore*/}

              sockets.delete(num);
            }
          }

          // if closed with error and pairing still true, just delete entry (allow retry later)
          if (connection === "close") {
            // if still pairing, clean up to allow a retry later
            if (entry.pairing) {
              try { sock.end(); } catch {}
              sockets.delete(num);
            }
          }
        } catch (ex) {
          console.error("onConnectionUpdate error:", ex);
          try { sock.end(); } catch {}
          sockets.delete(num);
        }
      };

      // attach the one-time listener (we keep it until connection open or close)
      sock.ev.on("connection.update", onConnectionUpdate);

      // Request pairing code (this should return quickly)
      try {
        const pairingCode = await sock.requestPairingCode(num);

        // send immediately to client
        return res.json({ code: pairingCode, status: "OK" });
      } catch (err) {
        // if requestPairingCode failed, cleanup and report
        entry.pairing = false;
        try { sock.end(); } catch {}
        sockets.delete(num);
        console.error("requestPairingCode error:", err);
        return res.status(500).json({ error: "WhatsApp a rejeté la demande. Réessaye plus tard." });
      }
    } else {
      // Already registered — quick path: upload and return session immediately
      try {
        await delay(1000);
        const authPath = authDir;
        const user = sock.user?.id;

        const mega_url = await upload(
          fs.createReadStream(authPath + "/creds.json"),
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

        // send session to the requesting client (not to WhatsApp user)
        return res.json({ message: "Déjà connecté", session: sessionID });
      } catch (e) {
        console.error("error uploading existing session:", e);
        return res.status(500).json({ error: "Erreur upload session" });
      }
    }
  } catch (err) {
    console.error("PAIR ROUTE ERROR:", err);
    return res.status(500).json({ error: "Erreur interne" });
  }
});

export default router;