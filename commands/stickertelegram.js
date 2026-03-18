// ==================== commands/tg.js ====================
import fetch from 'node-fetch'
import fs from 'fs'
import { exec } from 'child_process'
import { writeExif } from '../lib/exif.js'

const delay = ms => new Promise(r => setTimeout(r, ms))
const MAX_STICKERS = 200

function convertMedia(input, output, animated = false){
  return new Promise((resolve, reject)=>{
    const cmd = animated
      ? `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -preset default -an -vsync 0 "${output}"`
      : `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -loop 0 -preset default -an -vsync 0 "${output}"`

    exec(cmd, (err)=>{
      if(err) reject(err)
      else resolve()
    })
  })
}

export default {
  name: 'tg',
  alias: ['telegram','stickertg'],
  category: 'Sticker',
  description: 'Download Telegram sticker pack (animated supported)',

  async run(kaya, m, args){

    try{

      const url = args[0]

      if(!url){
        return kaya.sendMessage(m.chat,{
          text:'⚠️ Example:\n.tg https://t.me/addstickers/PackName'
        },{quoted:m})
      }

      if(!url.includes('t.me/addstickers/')){
        return kaya.sendMessage(m.chat,{
          text:'❌ Invalid Telegram sticker URL'
        },{quoted:m})
      }

      const packName = url.split('/').pop()
      const botToken = '8379893521:AAGmYtvhZ54NgKFB0_C1zsjkly7KcIIfWnU'

      const res = await fetch(`https://api.telegram.org/bot${botToken}/getStickerSet?name=${packName}`)
      const data = await res.json()

      if(!data.ok) throw 'Invalid pack'

      let stickers = data.result.stickers
      if(stickers.length > MAX_STICKERS) stickers = stickers.slice(0, MAX_STICKERS)

      const pushName = m.pushName || 'KAYA-MD'

      await kaya.sendMessage(m.chat,{
        text:`📦 Pack: ${stickers.length} stickers\n⏳ Downloading...`
      },{quoted:m})

      let success = 0

      for(let i = 0; i < stickers.length; i++){

        try{

          const sticker = stickers[i]

          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`)
          const fileJson = await fileRes.json()

          if(!fileJson.ok) continue

          const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileJson.result.file_path}`
          const buffer = Buffer.from(await (await fetch(fileUrl)).arrayBuffer())

          const input = `./tmp_${Date.now()}_${i}`
          const output = `./out_${Date.now()}_${i}.webp`

          fs.writeFileSync(input, buffer)

          const isAnimated = sticker.is_animated || sticker.is_video || fileJson.result.file_path.endsWith('.tgs')

          // 🔥 conversion PRO
          await convertMedia(input, output, isAnimated)

          const exifFile = await writeExif({
            data: fs.readFileSync(output),
            mimetype: 'image/webp'
          },{
            packname: pushName,
            author: pushName,
            categories:[sticker.emoji || '🤖']
          })

          const stickerBuffer = fs.readFileSync(exifFile)

          await kaya.sendMessage(m.chat,{sticker:stickerBuffer})

          success++

          // 🧹 CLEAN
          try{
            fs.unlinkSync(input)
            fs.unlinkSync(output)
            fs.unlinkSync(exifFile)
          }catch{}

          await delay(700)

        }catch(e){
          console.log('Sticker error', e)
        }

      }

      await kaya.sendMessage(m.chat,{
        text:`✅ Stickers sent: ${success}/${stickers.length}`
      },{quoted:m})

    }catch(err){

      console.log(err)

      await kaya.sendMessage(m.chat,{
        text:'❌ Failed to download pack'
      },{quoted:m})

    }

  }
}