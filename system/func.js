// ==================== func.js ====================
import fs from "fs"
import chalk from "chalk"
import crypto from "crypto"
import axios from "axios"
import moment from "moment-timezone"
import * as Jimp from "jimp"
import path from "path"
import { fileURLToPath } from "url"

// ✅ Elaina-Bail (Baileys v7 fork)
import {
  jidNormalizedUser,
  proto,
  getContentType,
  areJidsSameUser,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  delay
} from "@rexxhayanasi/elaina-bail"

// =================== Utils ===================
export const sizeFormatter = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const unixTimestampSeconds = (date = new Date()) =>
  Math.floor(date.getTime() / 1000)

export const generateMessageTag = (epoch) => {
  let tag = unixTimestampSeconds().toString()
  if (epoch) tag += ".--" + epoch
  return tag
}

export const processTime = (timestamp, now) =>
  moment.duration(now - moment(timestamp * 1000)).asSeconds()

export const getRandom = (ext = "") =>
  `${Math.floor(Math.random() * 10000)}${ext}`

export const getBuffer = async (url, options = {}) => {
  try {
    const res = await axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
      },
      ...options,
      responseType: "arraybuffer",
    })
    return res.data
  } catch (err) {
    return err
  }
}

export const reSize = async (buffer, x, y) => {
  const img = await Jimp.read(buffer)
  return img.resize(x, y).getBufferAsync(Jimp.MIME_JPEG)
}

export const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const isUrl = (url = "") =>
  url.match(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi
  )

export const getGroupAdmins = (participants = []) =>
  participants
    .filter((p) => p.admin === "admin" || p.admin === "superadmin")
    .map((p) => p.id)

// =================== Serialize Message ===================
export const smsg = (client, m) => {
  if (!m) return m

  m.id = m.key?.id
  m.chat = m.key?.remoteJid
  m.fromMe = m.key?.fromMe
  m.isGroup = m.chat?.endsWith("@g.us")

  m.sender = m.fromMe
    ? client.user?.id
    : jidNormalizedUser(m.key?.participant || m.participant || m.chat)

  m.mtype = getContentType(m.message)
  m.msg = m.mtype ? m.message[m.mtype] : null

  m.body =
    m.message?.conversation ||
    m.msg?.caption ||
    m.msg?.text ||
    (m.mtype === "listResponseMessage" &&
      m.msg?.singleSelectReply?.selectedRowId) ||
    (m.mtype === "buttonsResponseMessage" &&
      m.msg?.selectedButtonId) ||
    ""

  // =================== Quoted ===================
  const quoted = m.msg?.contextInfo?.quotedMessage
  if (quoted) {
    const type = getContentType(quoted)
    const quotedMsg = quoted[type]

    m.quoted = {
      mtype: type,
      msg: quotedMsg,
      id: m.msg.contextInfo.stanzaId,
      chat: m.chat,
      sender: jidNormalizedUser(m.msg.contextInfo.participant),
      text:
        quotedMsg?.text ||
        quotedMsg?.caption ||
        quotedMsg?.conversation ||
        ""
    }

    m.quoted.download = async () => {
      const stream = await downloadContentFromMessage(
        quotedMsg,
        type.replace("Message", "").toLowerCase()
      )
      const chunks = []
      for await (const chunk of stream) chunks.push(chunk)
      return Buffer.concat(chunks)
    }
  }

  // =================== Methods ===================
  m.reply = async (text, chatId = m.chat, options = {}) => {
    if (!client.sendMessage) return
    return client.sendMessage(
      chatId,
      typeof text === "string" ? { text } : text,
      { quoted: m, ...options }
    )
  }

  m.download = async () => {
    if (!m.msg) throw new Error("No media message")
    const type = m.mtype.replace("Message", "")
    const stream = await downloadContentFromMessage(
      m.msg,
      type.toLowerCase()
    )
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    return Buffer.concat(chunks)
  }

  return m
}

// =================== Hot Reload ===================
const __filename = fileURLToPath(import.meta.url)
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename)
  console.log(chalk.redBright(`Update ${__filename}`))
  import(`${path.resolve(__filename)}?update=${Date.now()}`)
})