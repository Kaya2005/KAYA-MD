const chalk = require('chalk')
const fs = require('fs')

global.allmenu = (prefix, hituet) => {
return`
*ᴡᴀɢᴡᴀɴ, ʜᴇʀᴇ ɪꜱ ᴀ ʟɪꜱᴛ ᴏꜰ ᴀʟʟ ᴛʜᴇ ᴍᴇɴᴜꜱ ᴏɴ* *${botname}*
*ᴅᴏɴ'ᴛ ʙʟᴏᴏᴅʏ ꜱᴘᴀᴍ, ʙʀᴏ* 
=========================
🇨🇩 ɴᴀᴍᴇ ʙᴏᴛ : *${botname}*
🇨🇩 ᴠᴇʀsɪᴏɴ : *1.0.0*
🇨🇩 ʀᴜɴ : *ᴘʀɪᴠᴀᴛᴇ ʜᴏsᴛɪɴɢ*
🇨🇩 ᴍᴏᴅᴇ: *${NanoBotz.public ? 'Public' : 'Self'}*
🇨🇩 ᴛʏᴘᴇ : ᴄᴀsᴇ
🇨🇩 ᴏᴡɴᴇʀ ʙᴏᴛ : 🍀𝙆𝘼𝙔𝘼🍀
=========================

┈─────────────────
       *\`🍀 KAYA MENU 🍀\`*
┈─────────────────

┏『 *\`🇨🇩 ᴏ ᴡ ɴ ᴇ ʀ - ᴏ ɴ ʟ ʏ 🇨🇩\`* 』━⊱
┣ᐉ *${prefix}channel*
┣ᐉ *${prefix}support*
┣ᐉ *${prefix}onlypc*
┣ᐉ *${prefix}onlygc*
┣ᐉ *${prefix}self*
┣ᐉ *${prefix}clear*
┣ᐉ *${prefix}public*
┣ᐉ *${prefix}join*
┣ᐉ *${prefix}broadcast*
┣ᐉ *${prefix}poll*
┣ᐉ *${prefix}creategc*
┣ᐉ *${prefix}setpackname*
┣ᐉ *${prefix}userjid*
┣ᐉ *${prefix}setbotname*
┣ᐉ *${prefix}setbotbio*
┣ᐉ *${prefix}restart*
┣ᐉ *${prefix}addprem*
┣ᐉ *${prefix}delprem*
┣ᐉ *${prefix}addowner*
┣ᐉ *${prefix}delowner*
┣ᐉ *${prefix}block*
┣ᐉ *${prefix}unblock*
┣ᐉ *${prefix}left*
┣ᐉ *${prefix}pushcontact*
┣ᐉ *${prefix}savecontact*
┣ᐉ *${prefix}savecontact2*
┣ᐉ *${prefix}getcontact*
┣ᐉ *${prefix}sendcontact*
┣ᐉ *${prefix}jpm*
┣ᐉ *${prefix}jpm2*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🍀 ɢ ʀ ᴏ ᴜ ᴘ - ᴍᴇɴᴜ 🍀\`* 』━◧
┣ᐉ *${prefix}unmute*
┣ᐉ *${prefix}mute*
┣ᐉ *${prefix}antilink*
┣ᐉ *${prefix}linkgc*
┣ᐉ *${prefix}invite*
┣ᐉ *${prefix}disappear*
┣ᐉ *${prefix}del*
┣ᐉ *${prefix}setname*
┣ᐉ *${prefix}setdesc*
┣ᐉ *${prefix}add*
┣ᐉ *${prefix}kick*
┣ᐉ *${prefix}promote*
┣ᐉ *${prefix}demote*
┣ᐉ *${prefix}hidetag*
┣ᐉ *${prefix}tag*
┣ᐉ *${prefix}tagall*
┣ᐉ *${prefix}resetlink*
┣ᐉ *${prefix}getbio*
┣ᐉ *${prefix}vote*
┣ᐉ *${prefix}upvote*
┣ᐉ *${prefix}downvote*
┣ᐉ *${prefix}checkvote*
┣ᐉ *${prefix}delvote*
┣ᐉ *${prefix}nsfw*
┗━━━━━━━━━━━━━━━━⊱
 
┏『 *\`🇨🇩 ᴀɴᴏɴʏᴍᴏᴜs-ᴍᴇɴᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}anonymouschat*
┣ᐉ *${prefix}start*
┣ᐉ *${prefix}next*
┣ᐉ *${prefix}stop*
┣ᐉ *${prefix}sendprofile*
┣ᐉ *${prefix}menfess*
┣ᐉ *${prefix}confess*
┣ᐉ *${prefix}replyfess*
┣ᐉ *${prefix}refusefess*
┣ᐉ *${prefix}stopmenfess*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🍀 ᴘ ᴜ s ʜ - ᴍᴇɴᴜ 🍀\`* 』━━◧
┣ᐉ *${prefix}cekidgc*
┣ᐉ *${prefix}pushcontact*
┣ᐉ *${prefix}savecontact*
┣ᐉ *${prefix}savecontact2*
┣ᐉ *${prefix}getcontact*
┣ᐉ *${prefix}sendcontact*
┣ᐉ *${prefix}jpm*
┣ᐉ *${prefix}jpm2*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🇨🇩 ᴅ ᴏ ᴡ ɴ ʟ ᴏ ᴀ ᴅ - ᴍᴇɴᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}image*
┣ᐉ *${prefix}tiktok*
┣ᐉ *${prefix}tiktokslide*
┣ᐉ *${prefix}tiktokaudio*
┣ᐉ *${prefix}ytsearch*
┣ᐉ *${prefix}ttsearch*
┣ᐉ *${prefix}play*
┣ᐉ *${prefix}play2*
┣ᐉ *${prefix}ytmp3*
┣ᐉ *${prefix}ytmp4*
┣ᐉ *${prefix}weather*
┣ᐉ *${prefix}instagram*
┣ᐉ *${prefix}facebook*
┣ᐉ *${prefix}twittervid*
┣ᐉ *${prefix}telestick*
┣ᐉ *${prefix}spotify*
┣ᐉ *${prefix}gitclone*
┣ᐉ *${prefix}happymod*
┣ᐉ *${prefix}pinterest*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🍀 ɢ ᴀ ᴍ ᴇ - ᴍᴇɴᴜ 🍀\`* 』━◧
┣ᐉ *${prefix}songguess*
┣ᐉ *${prefix}tictactoe*
┣ᐉ *${prefix}whoami*
┣ᐉ *${prefix}flagguess*
┣ᐉ *${prefix}flagguessv2*
┣ᐉ *${prefix}werewolf*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🇨🇩 s ᴛ ᴀ ʟ ᴋ ᴇ ʀ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}igstalk*
┣ᐉ *${prefix}ttstalk*
┣ᐉ *${prefix}mlstalk*
┣ᐉ *${prefix}npmstalk*
┣ᐉ *${prefix}ghstalk*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🍀 ᴏ ᴘ ᴇ ɴ - ᴀɪ 🍀\`* 』━◧
┣ᐉ *${prefix}leptonai*
┣ᐉ *${prefix}openai*
┣ᐉ *${prefix}ai*
┣ᐉ *${prefix}bard*
┣ᐉ *${prefix}guru-ai*
┣ᐉ *${prefix}realistic*
┣ᐉ *${prefix}blackboxai*
┣ᐉ *${prefix}lamaai*
┣ᐉ *${prefix}bingai*
┣ᐉ *${prefix}gpt*
┣ᐉ *${prefix}gpt2*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🇨🇩 ғ ᴜ ɴ - ᴍ ᴇ ɴ ᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}ppcouple*
┣ᐉ *${prefix}define*
┣ᐉ *${prefix}lyrics*
┣ᐉ *${prefix}suit*
┣ᐉ *${prefix}math*
┣ᐉ *${prefix}tictactoe*
┣ᐉ *${prefix}fact*
┣ᐉ *${prefix}truth*
┣ᐉ *${prefix}dare*
┣ᐉ *${prefix}couple*
┣ᐉ *${prefix}pick*
┣ᐉ *${prefix}quotes*
┣ᐉ *${prefix}gecg*
┣ᐉ *${prefix}checkme*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🍀 ʀ ᴀ ɴ ᴅ ᴏ ᴍ - ᴘ ʜ ᴏ ᴛ ᴏ 🍀\`* 』━◧
┣ᐉ *${prefix}aesthetic*
┣ᐉ *${prefix}wallpaper*
┣ᐉ *${prefix}art*
┣ᐉ *${prefix}bts*
┣ᐉ *${prefix}8ballpool*
┣ᐉ *${prefix}cosplay*
┣ᐉ *${prefix}hacker*
┣ᐉ *${prefix}cyber*
┣ᐉ *${prefix}gamewallpaper*
┣ᐉ *${prefix}islamic*
┣ᐉ *${prefix}cartoon*
┣ᐉ *${prefix}pentol*
┣ᐉ *${prefix}cat*
┣ᐉ *${prefix}kpop*
┣ᐉ *${prefix}exo*
┣ᐉ *${prefix}lisa*
┣ᐉ *${prefix}space*
┣ᐉ *${prefix}car*
┣ᐉ *${prefix}technology*
┣ᐉ *${prefix}bike*
┣ᐉ *${prefix}shortquote*
┣ᐉ *${prefix}hacking*
┣ᐉ *${prefix}rose*
┣ᐉ *${prefix}wallml*
┣ᐉ *${prefix}wallphone*
┣ᐉ *${prefix}mountain*
┣ᐉ *${prefix}profilepic*
┣ᐉ *${prefix}couplepic*
┣ᐉ *${prefix}programming*
┣ᐉ *${prefix}pubg*
┣ᐉ *${prefix}blackpink*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🇨🇩 ᴀ ɴ ɪ ᴍ ᴇ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}akira*
┣ᐉ *${prefix}akiyama*
┣ᐉ *${prefix}ana*
┣ᐉ *${prefix}asuna*
┣ᐉ *${prefix}ayuzawa*
┣ᐉ *${prefix}boruto*
┣ᐉ *${prefix}chiho*
┣ᐉ *${prefix}chitoge*
┣ᐉ *${prefix}cosplayloli*
┣ᐉ *${prefix}cosplaysagiri*
┣ᐉ *${prefix}deidara*
┣ᐉ *${prefix}doraemon*
┣ᐉ *${prefix}elaina*
┣ᐉ *${prefix}emilia*
┣ᐉ *${prefix}erza*
┣ᐉ *${prefix}gremory*
┣ᐉ *${prefix}hestia*
┣ᐉ *${prefix}hinata*
┣ᐉ *${prefix}husbu*
┣ᐉ *${prefix}inori*
┣ᐉ *${prefix}isuzu*
┣ᐉ *${prefix}itachi*
┣ᐉ *${prefix}itori*
┣ᐉ *${prefix}kaga*
┣ᐉ *${prefix}kagura*
┣ᐉ *${prefix}kakasih*
┣ᐉ *${prefix}kaori*
┣ᐉ *${prefix}keneki*
┣ᐉ *${prefix}kotori*
┣ᐉ *${prefix}kurumi*
┣ᐉ *${prefix}loli*
┣ᐉ *${prefix}madara*
┣ᐉ *${prefix}megumin*
┣ᐉ *${prefix}mikasa*
┣ᐉ *${prefix}mikey*
┣ᐉ *${prefix}miku*
┣ᐉ *${prefix}minato*
┣ᐉ *${prefix}naruto*
┣ᐉ *${prefix}neko*
┣ᐉ *${prefix}neko2*
┣ᐉ *${prefix}nekonime*
┣ᐉ *${prefix}nezuko*
┣ᐉ *${prefix}onepiece*
┣ᐉ *${prefix}pokemon*
┣ᐉ *${prefix}randomnime*
┣ᐉ *${prefix}randomnime2*
┣ᐉ *${prefix}rize*
┣ᐉ *${prefix}sagiri*
┣ᐉ *${prefix}sakura*
┣ᐉ *${prefix}sasuke*
┣ᐉ *${prefix}shina*
┣ᐉ *${prefix}shinka*
┣ᐉ *${prefix}shinomiya*
┣ᐉ *${prefix}shizuka*
┣ᐉ *${prefix}shota*
┣ᐉ *${prefix}tejina*
┣ᐉ *${prefix}toukachan*
┣ᐉ *${prefix}tsunade*
┣ᐉ *${prefix}waifu*
┣ᐉ *${prefix}animewall*
┣ᐉ *${prefix}yotsuba*
┣ᐉ *${prefix}yuki*
┣ᐉ *${prefix}yulibocil*
┣ᐉ *${prefix}yumeko*
┣ᐉ *${prefix}8ball*
┣ᐉ *${prefix}tickle*
┣ᐉ *${prefix}gecg*
┣ᐉ *${prefix}feed*
┣ᐉ *${prefix}animeawoo*
┣ᐉ *${prefix}animemegumin*
┣ᐉ *${prefix}animeshinobu*
┣ᐉ *${prefix}animehandhold*
┣ᐉ *${prefix}animehighfive*
┣ᐉ *${prefix}animecringe*
┣ᐉ *${prefix}animedance*
┣ᐉ *${prefix}animehappy*
┣ᐉ *${prefix}animeglomp*
┣ᐉ *${prefix}animeblush*
┣ᐉ *${prefix}animesmug*
┣ᐉ *${prefix}animewave*
┣ᐉ *${prefix}animesmile*
┣ᐉ *${prefix}animepoke*
┣ᐉ *${prefix}animewink*
┣ᐉ *${prefix}animebonk*
┣ᐉ *${prefix}animebully*
┣ᐉ *${prefix}animeyeet*
┣ᐉ *${prefix}animebite*
┣ᐉ *${prefix}animelick*
┣ᐉ *${prefix}animekill*
┣ᐉ *${prefix}animecry*
┣ᐉ *${prefix}animewlp*
┣ᐉ *${prefix}animekiss*
┣ᐉ *${prefix}animehug*
┣ᐉ *${prefix}animeneko*
┣ᐉ *${prefix}animepat*
┣ᐉ *${prefix}animeslap*
┣ᐉ *${prefix}animecuddle*
┣ᐉ *${prefix}animewaifu*
┣ᐉ *${prefix}animenom*
┣ᐉ *${prefix}animefoxgirl*
┣ᐉ *${prefix}animegecg*
┣ᐉ *${prefix}animetickle*
┣ᐉ *${prefix}animefeed*
┣ᐉ *${prefix}animeavatar*
┣ᐉ *${prefix}genshin*
┣ᐉ *${prefix}anime*
┣ᐉ *${prefix}amv*
╰━━━━━━━━━━━━━━━━━━

┏『 *\`🍀 ᴀ ɴ ɪ ᴍ ᴇ - ɴғsᴡ ㊕🍀\`* 』━◧ 
┣ᐉ *${prefix}paptt*
┣ᐉ *${prefix}hentaivid*
┣ᐉ *${prefix}hentaivid2*
┣ᐉ *${prefix}hneko*
┣ᐉ *${prefix}nwaifu*
┣ᐉ *${prefix}animespank*
┣ᐉ *${prefix}trap*
┣ᐉ *${prefix}gasm*
┣ᐉ *${prefix}ahegao*
┣ᐉ *${prefix}ass*
┣ᐉ *${prefix}bdsm*
┣ᐉ *${prefix}blowjob*
┣ᐉ *${prefix}cuckold*
┣ᐉ *${prefix}cum*
┣ᐉ *${prefix}milf*
┣ᐉ *${prefix}eba*
┣ᐉ *${prefix}ero*
┣ᐉ *${prefix}femdom*
┣ᐉ *${prefix}foot*
┣ᐉ *${prefix}gangbang* 
┣ᐉ *${prefix}glasses*
┣ᐉ *${prefix}jahy*
┣ᐉ *${prefix}masturbation*
┣ᐉ *${prefix}manga*
┣ᐉ *${prefix}neko-hentai*
┣ᐉ *${prefix}neko-hentai2*
┣ᐉ *${prefix}nsfwloli*
┣ᐉ *${prefix}orgy*
┣ᐉ *${prefix}panties*
┣ᐉ *${prefix}pussy*
┣ᐉ *${prefix}tentacles*
┣ᐉ *${prefix}thighs*
┣ᐉ *${prefix}yuri*
┣ᐉ *${prefix}zettai*
┣ᐉ *${prefix}xnxxsearch*
┗━━━━━━━━━━━━━━━━⊱ 

┏━『 *\`🇨🇩 ᴇ ᴘ ʜ ᴏ ᴛ ᴏ - ᴍ ᴀ ᴋ ᴇ ʀ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}glitchtext*
┣ᐉ *${prefix}writetext*
┣ᐉ *${prefix}advancedglow*
┣ᐉ *${prefix}typographytext*
┣ᐉ *${prefix}pixelglitch*
┣ᐉ *${prefix}neonglitch*
┣ᐉ *${prefix}flagtext*
┣ᐉ *${prefix}flag3dtext*
┣ᐉ *${prefix}deletingtext*
┣ᐉ *${prefix}blackpinkstyle*
┣ᐉ *${prefix}glowingtext*
┣ᐉ *${prefix}underwatertext*
┣ᐉ *${prefix}logomaker*
┣ᐉ *${prefix}cartoonstyle*
┣ᐉ *${prefix}papercutstyle*
┣ᐉ *${prefix}watercolortext*
┣ᐉ *${prefix}effectclouds*
┣ᐉ *${prefix}blackpinklogo*
┣ᐉ *${prefix}gradienttext*
┣ᐉ *${prefix}summerbeach*
┣ᐉ *${prefix}luxurygold*
┣ᐉ *${prefix}multicoloredneon*
┣ᐉ *${prefix}sandsummer*
┣ᐉ *${prefix}galaxywallpaper*
┣ᐉ *${prefix}1917style*
┣ᐉ *${prefix}makingneon*
┣ᐉ *${prefix}royaltext*
┣ᐉ *${prefix}freecreate*
┣ᐉ *${prefix}galaxystyle*
┣ᐉ *${prefix}lighteffects*
┗━━━━━━━━━━━━━━━━⊱


┏『 *\`🍀 ʙ ᴜ ɢ - ᴡ ᴀ ʀ ㊕🍀\`* 』━◧
┣ᐉ *${prefix}kayavip*
┣ᐉ *${prefix}kayacrush*
┣ᐉ *${prefix}systemuicrash*
┣ᐉ *${prefix}xios*
┣ᐉ *${prefix}xios2*
┣ᐉ *${prefix}xgc*
┣ᐉ *${prefix}ioskill*
┣ᐉ *${prefix}iosx*
┣ᐉ *${prefix}onekill*
┣ᐉ *${prefix}oneclickall*
┣ᐉ *${prefix}xsamsung*
┣ᐉ *${prefix}xwaweb*
┣ᐉ *${prefix}doublekill*
┣ᐉ *${prefix}triplekill*
┣ᐉ *${prefix}💀*
┗━━━━━━━━━━━━━━━━⊱

┏『 *\`🇨🇩 ᴏ ᴛ ʜ ᴇ ʀ - ᴍ ᴇ ɴ ᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}aza*
┣ᐉ *${prefix}ping*
┣ᐉ *${prefix}vv*
┣ᐉ *${prefix}paptt*
┣ᐉ *${prefix}totalcmd*
┣ᐉ *${prefix}menu*
┣ᐉ *${prefix}reportbug*
┣ᐉ *${prefix}listprem*
┣ᐉ *${prefix}listpc*
┣ᐉ *${prefix}listgc*
┣ᐉ *${prefix}owner*
┣ᐉ *${prefix}donate*
┣ᐉ *${prefix}obfuscate*
┣ᐉ *${prefix}fancy*
┣ᐉ *${prefix}say*
┣ᐉ *${prefix}togif*
┣ᐉ *${prefix}toqr*
┣ᐉ *${prefix}bass*
┣ᐉ *${prefix}blown*
┣ᐉ *${prefix}deep*
┣ᐉ *${prefix}earrape*
┣ᐉ *${prefix}fast*
┣ᐉ *${prefix}fat*
┣ᐉ *${prefix}nightcore*
┣ᐉ *${prefix}reverse*
┣ᐉ *${prefix}robot*
┣ᐉ *${prefix}slow*
┣ᐉ *${prefix}smooth*
┣ᐉ *${prefix}squirrel*
┣ᐉ *${prefix}tinyurl*
┣ᐉ *${prefix}tovn*
┣ᐉ *${prefix}toaudio*
┣ᐉ *${prefix}tomp3*
┣ᐉ *${prefix}tomp4*
┣ᐉ *${prefix}toimg*
┣ᐉ *${prefix}tovv*
┣ᐉ *${prefix}sticker*
┣ᐉ *${prefix}take*
┣ᐉ *${prefix}runtime*
┗━━━━━━━━━━━━━━━━⊱`}

global.animemenu = (prefix) => {
return`╭⊣「 *\`🍀 ᴍᴇɴᴜ ɪɴғᴏ ㊕🍀\`* 」⊢▤
┣ᐉ *${prefix}akira*
┣ᐉ *${prefix}akiyama*
┣ᐉ *${prefix}ana*
┣ᐉ *${prefix}asuna*
┣ᐉ *${prefix}ayuzawa*
┣ᐉ *${prefix}boruto*
┣ᐉ *${prefix}chiho*
┣ᐉ *${prefix}chitoge*
┣ᐉ *${prefix}cosplayloli*
┣ᐉ *${prefix}cosplaysagiri*
┣ᐉ *${prefix}deidara*
┣ᐉ *${prefix}doraemon*
┣ᐉ *${prefix}elaina*
┣ᐉ *${prefix}emilia*
┣ᐉ *${prefix}erza*
┣ᐉ *${prefix}gremory*
┣ᐉ *${prefix}hestia*
┣ᐉ *${prefix}hinata*
┣ᐉ *${prefix}husbu*
┣ᐉ *${prefix}inori*
┣ᐉ *${prefix}isuzu*
┣ᐉ *${prefix}itachi*
┣ᐉ *${prefix}itori*
┣ᐉ *${prefix}kaga*
┣ᐉ *${prefix}kagura*
┣ᐉ *${prefix}kakasih*
┣ᐉ *${prefix}kaori*
┣ᐉ *${prefix}keneki*
┣ᐉ *${prefix}kotori*
┣ᐉ *${prefix}kurumi*
┣ᐉ *${prefix}loli*
┣ᐉ *${prefix}madara*
┣ᐉ *${prefix}megumin*
┣ᐉ *${prefix}mikasa*
┣ᐉ *${prefix}mikey*
┣ᐉ *${prefix}miku*
┣ᐉ *${prefix}minato*
┣ᐉ *${prefix}naruto*
┣ᐉ *${prefix}neko*
┣ᐉ *${prefix}neko2*
┣ᐉ *${prefix}nekonime*
┣ᐉ *${prefix}nezuko*
┣ᐉ *${prefix}onepiece*
┣ᐉ *${prefix}pokemon*
┣ᐉ *${prefix}randomnime*
┣ᐉ *${prefix}randomnime2*
┣ᐉ *${prefix}rize*
┣ᐉ *${prefix}sagiri*
┣ᐉ *${prefix}sakura*
┣ᐉ *${prefix}sasuke*
┣ᐉ *${prefix}shina*
┣ᐉ *${prefix}shinka*
┣ᐉ *${prefix}shinomiya*
┣ᐉ *${prefix}shizuka*
┣ᐉ *${prefix}shota*
┣ᐉ *${prefix}tejina*
┣ᐉ *${prefix}toukachan*
┣ᐉ *${prefix}tsunade*
┣ᐉ *${prefix}waifu*
┣ᐉ *${prefix}animewall*
┣ᐉ *${prefix}yotsuba*
┣ᐉ *${prefix}yuki*
┣ᐉ *${prefix}yulibocil*
┣ᐉ *${prefix}yumeko*
┣ᐉ *${prefix}8ball*
┣ᐉ *${prefix}tickle*
┣ᐉ *${prefix}gecg*
┣ᐉ *${prefix}feed*
┣ᐉ *${prefix}animeawoo*
┣ᐉ *${prefix}animemegumin*
┣ᐉ *${prefix}animeshinobu*
┣ᐉ *${prefix}animehandhold*
┣ᐉ *${prefix}animehighfive*
┣ᐉ *${prefix}animecringe*
┣ᐉ *${prefix}animedance*
┣ᐉ *${prefix}animehappy*
┣ᐉ *${prefix}animeglomp*
┣ᐉ *${prefix}animeblush*
┣ᐉ *${prefix}animesmug*
┣ᐉ *${prefix}animewave*
┣ᐉ *${prefix}animesmile*
┣ᐉ *${prefix}animepoke*
┣ᐉ *${prefix}animewink*
┣ᐉ *${prefix}animebonk*
┣ᐉ *${prefix}animebully*
┣ᐉ *${prefix}animeyeet*
┣ᐉ *${prefix}animebite*
┣ᐉ *${prefix}animelick*
┣ᐉ *${prefix}animekill*
┣ᐉ *${prefix}animecry*
┣ᐉ *${prefix}animewlp*
┣ᐉ *${prefix}animekiss*
┣ᐉ *${prefix}animehug*
┣ᐉ *${prefix}animeneko*
┣ᐉ *${prefix}animepat*
┣ᐉ *${prefix}animeslap*
┣ᐉ *${prefix}animecuddle*
┣ᐉ *${prefix}animewaifu*
┣ᐉ *${prefix}animenom*
┣ᐉ *${prefix}animefoxgirl*
┣ᐉ *${prefix}animegecg*
┣ᐉ *${prefix}animetickle*
┣ᐉ *${prefix}animefeed*
┣ᐉ *${prefix}animeavatar*
┣ᐉ *${prefix}genshin*
┣ᐉ *${prefix}anime*
┣ᐉ *${prefix}amv*
╰━━━━━━━━━━━━━━━━━━`}

global.ownermenu = (prefix) => {
return`┏『 *\`🇨🇩 ᴏ ᴡ ɴ ᴇ ʀ - ᴏ ɴ ʟ ʏ 🇨🇩\`* 』━⊱

┣ᐉ *${prefix}channel*
┣ᐉ *${prefix}support*
┣ᐉ *${prefix}onlypc*
┣ᐉ *${prefix}onlygc*
┣ᐉ *${prefix}self*
┣ᐉ *${prefix}clear*
┣ᐉ *${prefix}public*
┣ᐉ *${prefix}join*
┣ᐉ *${prefix}broadcast*
┣ᐉ *${prefix}poll*
┣ᐉ *${prefix}creategc*
┣ᐉ *${prefix}setpackname*
┣ᐉ *${prefix}userjid*
┣ᐉ *${prefix}restart*
┣ᐉ *${prefix}addprem*
┣ᐉ *${prefix}delprem*
┣ᐉ *${prefix}addowner*
┣ᐉ *${prefix}delowner*
┣ᐉ *${prefix}block*
┣ᐉ *${prefix}unblock*
┣ᐉ *${prefix}left*
┣ᐉ *${prefix}pushcontact*
┣ᐉ *${prefix}savecontact*
┣ᐉ *${prefix}savecontact2*
┣ᐉ *${prefix}getcontact*
┣ᐉ *${prefix}sendcontact*
┣ᐉ *${prefix}jpm*
┣ᐉ *${prefix}jpm2*
┗━━━━━━━━━━━━━━━━⊱`}

global.othermenu = (prefix) => {
return`┏『 *\`🍀 ᴏ ᴛ ʜ ᴇ ʀ - ᴍ ᴇ ɴ ᴜ 🍀\`* 』━◧
┣ᐉ *${prefix}aza*
┣ᐉ *${prefix}ping*
┣ᐉ *${prefix}vv*
┣ᐉ *${prefix}paptt*
┣ᐉ *${prefix}totalcmd*
┣ᐉ *${prefix}menu*
┣ᐉ *${prefix}reportbug*
┣ᐉ *${prefix}listprem*
┣ᐉ *${prefix}listpc*
┣ᐉ *${prefix}listgc*
┣ᐉ *${prefix}owner*
┣ᐉ *${prefix}donate*
┣ᐉ *${prefix}obfuscate*
┣ᐉ *${prefix}fancy*
┣ᐉ *${prefix}say*
┣ᐉ *${prefix}togif*
┣ᐉ *${prefix}toqr*
┣ᐉ *${prefix}bass*
┣ᐉ *${prefix}blown*
┣ᐉ *${prefix}deep*
┣ᐉ *${prefix}earrape*
┣ᐉ *${prefix}fast*
┣ᐉ *${prefix}fat*
┣ᐉ *${prefix}nightcore*
┣ᐉ *${prefix}reverse*
┣ᐉ *${prefix}robot*
┣ᐉ *${prefix}slow*
┣ᐉ *${prefix}smooth*
┣ᐉ *${prefix}squirrel*
┣ᐉ *${prefix}tinyurl*
┣ᐉ *${prefix}tovn*
┣ᐉ *${prefix}toaudio*
┣ᐉ *${prefix}tomp3*
┣ᐉ *${prefix}tomp4*
┣ᐉ *${prefix}toimg*
┣ᐉ *${prefix}tovv*
┣ᐉ *${prefix}sticker*
┣ᐉ *${prefix}take*
┣ᐉ *${prefix}runtime*
┗━━━━━━━━━━━━━━━━⊱`}

global.gamemenu = (prefix, hituet) => {
return`┏『 *\`🇨🇩 ɢ ᴀ ᴍ ᴇ - ᴍᴇɴᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}songguess*
┣ᐉ *${prefix}tictactoe*
┣ᐉ *${prefix}whoami*
┣ᐉ *${prefix}flagguess*
┣ᐉ *${prefix}flagguessv2*
┣ᐉ *${prefix}werewolf*
┗━━━━━━━━━━━━━━━━⊱`}

global.downloadmenu = (prefix) => { 
return`┏『 *\`🍀 ᴅ ᴏ ᴡ ɴ ʟ ᴏ ᴀ ᴅ - ᴍᴇɴᴜ 🍀\`* 』━◧
┣ᐉ *${prefix}image*
┣ᐉ *${prefix}tiktok*
┣ᐉ *${prefix}tiktokslide*
┣ᐉ *${prefix}tiktokaudio*
┣ᐉ *${prefix}ytsearch*
┣ᐉ *${prefix}ttsearch*
┣ᐉ *${prefix}play*
┣ᐉ *${prefix}play2*
┣ᐉ *${prefix}ytmp3*
┣ᐉ *${prefix}ytmp4*
┣ᐉ *${prefix}weather*
┣ᐉ *${prefix}instagram*
┣ᐉ *${prefix}facebook*
┣ᐉ *${prefix}twittervid*
┣ᐉ *${prefix}telestick*
┣ᐉ *${prefix}spotify*
┣ᐉ *${prefix}gitclone*
┣ᐉ *${prefix}happymod*
┣ᐉ *${prefix}pinterest*
┗━━━━━━━━━━━━━━━━⊱`}

global.groupmenu = (prefix) => {
return`┏『 *\`🇨🇩 ɢ ʀ ᴏ ᴜ ᴘ - ᴍᴇɴᴜ 🇨🇩\`* 』━◧

┣ᐉ *${prefix}unmute*
┣ᐉ *${prefix}mute*
┣ᐉ *${prefix}antilink*
┣ᐉ *${prefix}linkgc*
┣ᐉ *${prefix}invite*
┣ᐉ *${prefix}disappear*
┣ᐉ *${prefix}del*
┣ᐉ *${prefix}setname*
┣ᐉ *${prefix}setdesc*
┣ᐉ *${prefix}add*
┣ᐉ *${prefix}kick*
┣ᐉ *${prefix}promote*
┣ᐉ *${prefix}demote*
┣ᐉ *${prefix}hidetag*
┣ᐉ *${prefix}tag*
┣ᐉ *${prefix}tagall*
┣ᐉ *${prefix}resetlink*
┣ᐉ *${prefix}getbio*
┣ᐉ *${prefix}vote*
┣ᐉ *${prefix}upvote*
┣ᐉ *${prefix}downvote*
┣ᐉ *${prefix}checkvote*
┣ᐉ *${prefix}delvote*
┣ᐉ *${prefix}nsfw*
┗━━━━━━━━━━━━━━━━⊱`}

global.funmenu = (prefix) => {
return`┏『 *\`🇨🇩 ғ ᴜ ɴ - ᴍ ᴇ ɴ ᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}ppcouple*
┣ᐉ *${prefix}define*
┣ᐉ *${prefix}lyrics*
┣ᐉ *${prefix}suit*
┣ᐉ *${prefix}math*
┣ᐉ *${prefix}tictactoe*
┣ᐉ *${prefix}fact*
┣ᐉ *${prefix}truth*
┣ᐉ *${prefix}dare*
┣ᐉ *${prefix}couple*
┣ᐉ *${prefix}pick*
┣ᐉ *${prefix}quotes*
┣ᐉ *${prefix}gecg*
┣ᐉ *${prefix}checkme*
┣ᐉ *${prefix}sound1 - sound161*
┗━━━━━━━━━━━━━━━━⊱`}

global.stalkermenu = (prefix) => {
  return `┏『 *\`🍀 s ᴛ ᴀ ʟ ᴋ ᴇ ʀ 🍀\`* 』━◧
┣ᐉ *${prefix}igstalk*
┣ᐉ *${prefix}ttstalk*
┣ᐉ *${prefix}mlstalk*
┣ᐉ *${prefix}npmstalk*
┣ᐉ *${prefix}ghstalk*
┗━━━━━━━━━━━━━━━━⊱`}

global.aimenu = (prefix) => {
return`┏『 *\`🇨🇩 ᴏ ᴘ ᴇ ɴ - ᴀɪ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}leptonai*
┣ᐉ *${prefix}openai*
┣ᐉ *${prefix}ai*
┣ᐉ *${prefix}bard*
┣ᐉ *${prefix}guru-ai*
┣ᐉ *${prefix}realistic*
┣ᐉ *${prefix}blackboxai*
┣ᐉ *${prefix}lamaai*
┣ᐉ *${prefix}bingai*
┣ᐉ *${prefix}gpt*
┣ᐉ *${prefix}gpt2*
┗━━━━━━━━━━━━━━━━⊱`}

global.anonymousmenu = (prefix) => {
return`┏『 *\`🇨🇩 ᴀɴᴏɴʏᴍᴏᴜs-ᴍᴇɴᴜ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}anonymouschat*
┣ᐉ *${prefix}start*
┣ᐉ *${prefix}next*
┣ᐉ *${prefix}stop*
┣ᐉ *${prefix}sendprofile*
┣ᐉ *${prefix}menfess*
┣ᐉ *${prefix}confess*
┣ᐉ *${prefix}replyfess*
┣ᐉ *${prefix}refusefess*
┣ᐉ *${prefix}stopmenfess*
┗━━━━━━━━━━━━━━━━⊱`}

global.pushmenu = (prefix) => {
return`┏『 *\`🍀 ᴘ ᴜ s ʜ - ᴍᴇɴᴜ 🍀\`* 』━━◧
┣ᐉ *${prefix}cekidgc*
┣ᐉ *${prefix}id*
┣ᐉ *${prefix}pushcontact*
┣ᐉ *${prefix}savecontact*
┣ᐉ *${prefix}savecontact2*
┣ᐉ *${prefix}getcontact*
┣ᐉ *${prefix}sendcontact*
┣ᐉ *${prefix}jpm*
┣ᐉ *${prefix}jpm2*
┗━━━━━━━━━━━━━━━━⊱`}

global.bugmenu = (prefix) => {
return`┏『 *\`🇨🇩 ʙ ᴜ ɢ - ᴡ ᴀ ʀ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}patronvip*
┣ᐉ *${prefix}patroncrush*
┣ᐉ *${prefix}systemuicrash*
┣ᐉ *${prefix}xios*
┣ᐉ *${prefix}xios2*
┣ᐉ *${prefix}xgc*
┣ᐉ *${prefix}ioskill*
┣ᐉ *${prefix}iosx*
┣ᐉ *${prefix}onekill*
┣ᐉ *${prefix}oneclickall*
┣ᐉ *${prefix}xsamsung*
┣ᐉ *${prefix}xwaweb*
┣ᐉ *${prefix}doublekill*
┣ᐉ *${prefix}triplekill*
┣ᐉ *${prefix}💀*
┗━━━━━━━━━━━━━━━━⊱`}

global.randomphotomenu = (prefix) => {
return`┏『 *\`🍀 ʀ ᴀ ɴ ᴅ ᴏ ᴍ - ᴘ ʜ ᴏ ᴛ ᴏ 🍀\`* 』━◧
┣ᐉ *${prefix}aesthetic*
┣ᐉ *${prefix}wallpaper*
┣ᐉ *${prefix}art*
┣ᐉ *${prefix}bts*
┣ᐉ *${prefix}8ballpool*
┣ᐉ *${prefix}cosplay*
┣ᐉ *${prefix}hacker*
┣ᐉ *${prefix}cyber*
┣ᐉ *${prefix}gamewallpaper*
┣ᐉ *${prefix}islamic*
┣ᐉ *${prefix}cartoon*
┣ᐉ *${prefix}pentol*
┣ᐉ *${prefix}cat*
┣ᐉ *${prefix}kpop*
┣ᐉ *${prefix}exo*
┣ᐉ *${prefix}lisa*
┣ᐉ *${prefix}space*
┣ᐉ *${prefix}car*
┣ᐉ *${prefix}technology*
┣ᐉ *${prefix}bike*
┣ᐉ *${prefix}shortquote*
┣ᐉ *${prefix}hacking*
┣ᐉ *${prefix}rose*
┣ᐉ *${prefix}wallml*
┣ᐉ *${prefix}wallphone*
┣ᐉ *${prefix}mountain*
┣ᐉ *${prefix}profilepic*
┣ᐉ *${prefix}couplepic*
┣ᐉ *${prefix}programming*
┣ᐉ *${prefix}pubg*
┣ᐉ *${prefix}blackpink*
┗━━━━━━━━━━━━━━━━⊱`}

global.ephoto360menu = (prefix) => {
return`┏━『 *\`🇨🇩 ᴇ ᴘ ʜ ᴏ ᴛ ᴏ - ᴍ ᴀ ᴋ ᴇ ʀ 🇨🇩\`* 』━◧
┣ᐉ *${prefix}glitchtext*
┣ᐉ *${prefix}writetext*
┣ᐉ *${prefix}advancedglow*
┣ᐉ *${prefix}typographytext*
┣ᐉ *${prefix}pixelglitch*
┣ᐉ *${prefix}neonglitch*
┣ᐉ *${prefix}flagtext*
┣ᐉ *${prefix}flag3dtext*
┣ᐉ *${prefix}deletingtext*
┣ᐉ *${prefix}blackpinkstyle*
┣ᐉ *${prefix}glowingtext*
┣ᐉ *${prefix}underwatertext*
┣ᐉ *${prefix}logomaker*
┣ᐉ *${prefix}cartoonstyle*
┣ᐉ *${prefix}papercutstyle*
┣ᐉ *${prefix}watercolortext*
┣ᐉ *${prefix}effectclouds*
┣ᐉ *${prefix}blackpinklogo*
┣ᐉ *${prefix}gradienttext*
┣ᐉ *${prefix}summerbeach*
┣ᐉ *${prefix}luxurygold*
┣ᐉ *${prefix}multicoloredneon*
┣ᐉ *${prefix}sandsummer*
┣ᐉ *${prefix}galaxywallpaper*
┣ᐉ *${prefix}1917style*
┣ᐉ *${prefix}makingneon*
┣ᐉ *${prefix}royaltext*
┣ᐉ *${prefix}freecreate*
┣ᐉ *${prefix}galaxystyle*
┣ᐉ *${prefix}lighteffects*
┗━━━━━━━━━━━━━━━━⊱`}

global.nsfwmenu = (prefix) => {
return`┏『 *\`🍀 ᴀ ɴ ɪ ᴍ ᴇ - ɴғsᴡ 🍀\`* 』━◧
┣ᐉ *${prefix}paptt*
┣ᐉ *${prefix}hentaivid 
┣ᐉ *${prefix}hneko 
┣ᐉ *${prefix}nwaifu 
┣ᐉ *${prefix}animespank 
┣ᐉ *${prefix}trap 
┣ᐉ *${prefix}gasm 
┣ᐉ *${prefix}ahegao 
┣ᐉ *${prefix}ass 
┣ᐉ *${prefix}bdsm 
┣ᐉ *${prefix}blowjob 
┣ᐉ *${prefix}cuckold 
┣ᐉ *${prefix}cum 
┣ᐉ *${prefix}milf 
┣ᐉ *${prefix}eba 
┣ᐉ *${prefix}ero 
┣ᐉ *${prefix}femdom 
┣ᐉ *${prefix}foot 
┣ᐉ *${prefix}gangbang 
┣ᐉ *${prefix}glasses 
┣ᐉ *${prefix}jahy 
┣ᐉ *${prefix}masturbation 
┣ᐉ *${prefix}manga 
┣ᐉ *${prefix}neko-hentai 
┣ᐉ *${prefix}neko-hentai2 
┣ᐉ *${prefix}nsfwloli 
┣ᐉ *${prefix}orgy 
┣ᐉ *${prefix}panties  
┣ᐉ *${prefix}pussy 
┣ᐉ *${prefix}tentacles 
┣ᐉ *${prefix}thighs 
┣ᐉ *${prefix}yuri 
┣ᐉ *${prefix}zettai 
┣ᐉ *${prefix}xnxxsearch
┗━━━━━━━━━━━━━━━━⊱`}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})
