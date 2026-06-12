import axios from 'axios';

console.log('✅ wasted command loaded');

export default {

    name: 'wasted',

    aliases: [
        'rip',
        'dead'
    ],

    category: 'fun',

    description:
        'Ajoute l’effet Wasted',

    async execute(
        kaya,
        m,
        args
    ) {

        try {

            const chatId = m.chat;

            let userToWaste =
                m.sender;

            // =====================
            // MENTION
            // =====================

            const mentioned =
                m.message
                  ?.extendedTextMessage
                  ?.contextInfo
                  ?.mentionedJid;

            if (
                mentioned &&
                mentioned.length > 0
            ) {

                userToWaste =
                    mentioned[0];
            }

            // =====================
            // PROFILE PIC
            // =====================

            let profilePic;

            try {

                profilePic =
                    await kaya.profilePictureUrl(
                        userToWaste,
                        'image'
                    );

            } catch {

                profilePic =
                    'https://i.imgur.com/2wzGhpF.jpeg';
            }

            // =====================
            // API
            // =====================

            const api =
`https://api.popcat.xyz/wasted?image=${encodeURIComponent(profilePic)}`;

            console.log(api);

            const response =
                await axios.get(
                    api,
                    {
                        responseType:
                            'arraybuffer',

                        timeout:
                            60000
                    }
                );

            // =====================
            // SEND
            // =====================

            await kaya.sendMessage(

                chatId,

                {

                    image:
                        Buffer.from(
                            response.data
                        ),

                    caption:
`⚰️ WASTED ⚰️

@${userToWaste.split('@')[0]}`,

                    mentions: [
                        userToWaste
                    ]
                },

                {
                    quoted: m
                }
            );

        } catch (err) {

            console.error(
                '❌ wasted error:',
                err
            );

            await kaya.sendMessage(

                m.chat,

                {
                    text:
`❌ Commande wasted en erreur.`
                },

                {
                    quoted: m
                }
            );
        }
    }
};