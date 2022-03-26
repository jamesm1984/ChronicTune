const Discord = require("discord.js")
const { MessageEmbed } = require('discord.js');
const { DisTube } = require("distube")
const { YtDlpPlugin } = require("@distube/yt-dlp")
const { SoundCloudPlugin } = require("@distube/soundcloud")
const { SpotifyPlugin } = require("@distube/spotify")
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_VOICE_STATES", "GUILD_MESSAGES"]
})
const config = {
    prefix: "$",
    token: "OTAxMjgwODU2NTAzNjE1NTA4.YXNlNQ.pceNE1LR_vc9qxcJwtzUsVhDioU",
}

// Create a new DisTube
const distube = new DisTube(client, {
    searchSongs: 1,
    searchCooldown: 30,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: false,
    youtubeDL: false,
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin(), new YtDlpPlugin()]
})

const embedMessage = {
    color: 0x8E05DE,
    thumbnail: {
        url: 'http://www.jamesmcgaghey.com/img/ccico2.png',
    },
    footer: {
        text: '',
    },
};
const helpMessage = {
    color: 0x8E05DE,
    title: 'Help',
    thumbnail: {
        url: 'http://www.jamesmcgaghey.com/img/ccico2.png',
    },
    fields: [
        {
            name: `${config.prefix} play [URL or keyword]`,
            value: 'Plays Youtube, SoundCloud, Spotify'
        },
        {
            name: '\u200b',
            value: '\u200b',
            inline: false,
        },
        {
            name:  `${config.prefix}pause`,
            value: 'Pauses the current song',
            inline: true,
        },
        {
            name:  `${config.prefix}resume`,
            value: 'Resumes paused song',
            inline: true,
        },
        {
            name:  `${config.prefix}skip`,
            value: 'Skips to next song',
            inline: true,
        },
        {
            name:  `${config.prefix}stop`,
            value: 'Stops the song and clears queue',
            inline: true,
        },
        {
            name:  `${config.prefix}queue`,
            value: 'Queue',
            inline: true,
        },
        // {
        //     name:  `${config.prefix}jump [song number]`,
        //     value: 'Jumps to selected song and removes songs before selected song',
        //     inline: true,
        // },
        {
            name:  `${config.prefix}leave`,
            value: 'Disconnects from room',
            inline: true,
        },
        {
            name: '\u200b',
            value: '\u200b',
            inline: false,
        },
        {
            name: 'Special Commands',
            value: '\u200b',
            inline: false,
        },
        {
            name:  `${config.prefix}drugstime`,
            value: 'Plays drugs time',
            inline: true,
        },
        {
            name:  `${config.prefix}torchblood`,
            value: 'Plays torchblood song',
            inline: true,
        },
        {
            name: '\u200b',
            value: '\u200b',
            inline: false,
        }
        
        
    ],
    footer: {
        text: ''
    },
};
var currentVoiceChannel = ''
var timer = '';
var isPaused = false;
client.on("ready", () => {
    console.log(`[ ChronicTune ] - Logged in as ${client.user.tag}!`)
})
// client.on("debug", console.log)

client.on("messageCreate", message => {
    if (message.author.bot || !message.inGuild()) return

    if (!message.content.startsWith(config.prefix)) return
    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/g)
    const command = args.shift()

    if (command === "help") {
        message.delete();
        user = message.author
        helpMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
        message.channel.send({ embeds: [helpMessage] }).then(msg => {
            setTimeout(() => msg.delete(), 20000)
        });
        console.log(`[ ChronicTune ] Help (Requested by: ${message.author.username}#${message.author.discriminator})`)
    }

    if (command === 'play') {
        setTimeout(() => message.delete(), 5000);
        const voiceChannel = message.member.voice.channel
        
        if (voiceChannel) {
            if (!args[0]){ 
                return message.channel.send('You must state something to play.').then(msg => {
                    setTimeout(() => 
                        msg.delete(), 5000
                    )
                });
            }else {
                if (timer > ''){
                    currentVoiceChannel = message.member.voice.channel;
                    console.log("[ ChronicTune ] - AFK timer cleared")
                    clearTimeout(timer);
                    distube.play(voiceChannel, args.join(' '), {
                        message,
                        textChannel: message.channel,
                        member: message.member,
                    })
                }else {
                    currentVoiceChannel = message.member.voice.channel;
                    distube.play(voiceChannel, args.join(' '), {
                        message,
                        textChannel: message.channel,
                        member: message.member,
                    })
                }
            }
        } else {
            if (!args[0]){ 
                return message.channel.send('You must state something to play.').then(msg => {
                    setTimeout(() => 
                        msg.delete(), 5000
                    )
                });
            }else {
                return message.channel.send('You must in the same voice channel as the bot').then(msg => {
                    setTimeout(() => 
                         msg.delete(), 5000
                    )
                });
            }
            
        }
    }

    if (command === "stop") {
        message.delete();

        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });
            return 
        }

        distube.stop(message)
        user = message.author
        embedMessage.title = 'Stopped'
        embedMessage.description = ``
        embedMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
        message.channel.send({ embeds: [embedMessage] }).then(msg => {
            setTimeout(() => msg.delete(), 10000)
        })
        console.log(`[ ChronicTune ] Stop (Requested by: ${message.author.username}#${message.author.discriminator})`)
        if (isPaused === true){
            isPaused = false
        }
    }

    if (command === "leave") {
        message.delete();
        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });
            
            return 
        }
        distube.voices.get(message)?.leave()
        currentVoiceChannel = ''
        if (isPaused === true){
            isPaused = false
        }
        console.log(`[ ChronicTune ] Disconnect (Requested by: ${message.author.username}#${message.author.discriminator})`)
    }

    if (command === "resume") {
        message.delete();
        if(isPaused === false){
            if (currentVoiceChannel != message.member.voice.channel) {
                message.channel.send('You must in the same voice channel as the bot').then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                });
                return 
            }
            message.channel.send('Nothing to resume').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });
            console.log(`[ ChronicTune ] Resume [ Nothing in queue ] (Requested by: ${message.author.username}#${message.author.discriminator})`)
            return 
        }
        
        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });
            return 
        }
        distube.resume(message)
        user = message.author
        embedMessage.title = 'Resumed'
        embedMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
        message.channel.send({ embeds: [embedMessage] }).then(msg => {
            setTimeout(() => msg.delete(), 10000)
        })
        console.log(`[ ChronicTune ] Resume (Requested by: ${message.author.username}#${message.author.discriminator})`)
        isPaused = false

    }

    if (command === "pause") {
        message.delete();
        
        if (!isPaused){
            if (currentVoiceChannel != message.member.voice.channel) {
                message.channel.send('You must in the same voice channel as the bot').then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                });
                return 
            }
            distube.pause(message)
            user = message.author
            embedMessage.title = 'Paused'
            embedMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
            message.channel.send({ embeds: [embedMessage] }).then(msg => {
                setTimeout(() => msg.delete(), 10000)
            })
            isPaused = true
            console.log(`[ ChronicTune ] Pause (Requested by: ${message.author.username}#${message.author.discriminator})`)
            return
        }

        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });
            return 
        }

        message.channel.send('Song is already paused').then(msg => {
            setTimeout(() => msg.delete(), 5000)
        });
        console.log(`[ ChronicTune ] Pause [ Already paused ] (Requested by: ${message.author.username}#${message.author.discriminator})`)
    }

    if (command === "skip") {
        message.delete();

        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });
            return 
        }
        const queue = distube.getQueue(message)

        if (!queue || !queue.songs.length){
            console.log("[ ChronicTune ] - AFK timer started")
            clearTimeout(timer);
            timer = setTimeout(function(){
                console.log("[ ChronicTune ] - AFK 5 minutes")
                distube.voices.get(queue)?.leave()
                currentVoiceChannel = ''   
            }, 300000 );
            user = message.author
            embedMessage.title = 'Skipped'
            embedMessage.description = `No more songs in queue`
            embedMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
            
            message.channel.send(
                { embeds: [embedMessage] }
            ).then(msg => {
                setTimeout(() => msg.delete(), 10000)
            })
            return
        }
                    
        if (queue.songs.length <= 1) {
            console.log("[ ChronicTune ] - AFK timer started")
            clearTimeout(timer);
            timer = setTimeout(function(){
                console.log("[ ChronicTune ] - AFK 5 minutes")
                distube.voices.get(queue)?.leave()
                currentVoiceChannel = ''    
            }, 300000 );
            distube.stop(message)
            user = message.author
            embedMessage.title = 'Skipped'
            embedMessage.description = `No more songs in queue`
            embedMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
            
            message.channel.send(
                { embeds: [embedMessage] }
            ).then(msg => {
                setTimeout(() => msg.delete(), 10000)
            })
            return
        } else {
            if (isPaused === true){
               distube.resume(message)
            }
            
            isPaused = false
            console.log(`[ ChronicTune ] Skip (Requested by: ${message.author.username}#${message.author.discriminator})`)
            
            distube.skip(message)
            user = message.author
            embedMessage.title = 'Skipped'
            embedMessage.footer.text = `Requested by: ${message.author.username}#${message.author.discriminator}`
            message.channel.send(
                { embeds: [embedMessage] }
            ).then(msg => {
                setTimeout(() => msg.delete(), 10000)
            })
            return
        }
    }

    if (command === "queue") {
        message.delete();
        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                setTimeout(() => msg.delete(), 5000)
            });;
            return 
        }
        const queue = distube.getQueue(message)
        if (!queue) {
            message.channel.send('Nothing in the queue right now, try playing something')
        } else {
            const length = queue.songs.length
            message.channel.send(

                `Currently ${queue.songs.length} in queue\n\nCurrent queue:\n${queue.songs
                    .map(
                        (song, id) =>
                            `**${id ? id : 'Playing'}**. ${
                                song.name
                            } - \`${song.formattedDuration}\``,
                    )
                    .slice(0, 10)
                    .join('\n')}`,
            ).then(msg => {
                setTimeout(() => msg.delete(), 20000)
            });
            console.log(`[ ChronicTune ] Queue (Requested by: ${message.author.username}#${message.author.discriminator})`)
        }
    }

    // if (command === "jump"){
    //     message.delete();
    //     if (currentVoiceChannel != message.member.voice.channel) {
    //         message.channel.send('You must in the same voice channel as the bot').then(msg => {
    //                 setTimeout(() => msg.delete(), 5000)
    //             });
    //         console.log(`[ ChronicTune ] Jump (Requested by: ${message.author.username}#${message.author.discriminator})`)
    //         return 
    //     }
    //     if (isPaused === true){
    //         distube.resume(message)
        
    //         distube.jump(message, parseInt(args[0])).catch(err => message.channel.send("Invalid song number."))
    //             .then(msg => {
    //                 setTimeout(() => msg.delete(), 5000)
    //             });
    //         isPaused = false
    //     }else {
    //         distube.jump(message, parseInt(args[0])).catch(err => message.channel.send("Invalid song number."))
    //             .then(msg => {
    //                 setTimeout(() => msg.delete(), 5000)
    //             });
    //     }
    //     console.log(`[ ChronicTune ] Jump (Requested by: ${message.author.username}#${message.author.discriminator})`)

    // }

    if (command === "drugstime"){
        setTimeout(() => message.delete(), 5000);
        if (!currentVoiceChannel) {
            const voiceChannel = message.member.voice.channel
            currentVoiceChannel = message.member.voice.channel;
            distube.play(voiceChannel, 'http://jamesmcgaghey.com/updte.mp3', {
                message,
                textChannel: message.channel,
                member: message.member,
            })
            // distube.play(message, 'http://jamesmcgaghey.com/updte.mp3');
            console.log(`[ ChronicTune ] Drugs Time (Requested by: ${message.author.username}#${message.author.discriminator})`)
            return 
        }
        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                });
            return 
        }
        distube.play(message, 'http://jamesmcgaghey.com/updte.mp3');
        console.log(`[ ChronicTune ] Drugs Time (Requested by: ${message.author.username}#${message.author.discriminator})`)
    }

    if (command === "torchblood"){
        setTimeout(() => message.delete(), 5000);
        if (!currentVoiceChannel) {
            const voiceChannel = message.member.voice.channel
            currentVoiceChannel = message.member.voice.channel;
            distube.play(voiceChannel, 'https://www.youtube.com/watch?v=bxrRZFytans', {
                message,
                textChannel: message.channel,
                member: message.member,
            })
            // distube.play(message, 'https://www.youtube.com/watch?v=bxrRZFytans');
            console.log(`[ ChronicTune ] Torch Blood (Requested by: ${message.author.username}#${message.author.discriminator})`)
            return 
        }
        if (currentVoiceChannel != message.member.voice.channel) {
            message.channel.send('You must in the same voice channel as the bot').then(msg => {
                    setTimeout(() => msg.delete(), 5000)
                });
            return 
        }
        distube.play(message, 'https://www.youtube.com/watch?v=bxrRZFytans');
        console.log(`[ ChronicTune ] Torch Blood (Requested by: ${message.author.username}#${message.author.discriminator})`)
    }

})

// DisTube event listeners, more in the documentation page
distube
    .on("playSong", (queue, song) => {
        songDurationMs = song.duration*1000
        embedMessage.title = 'Now Playing'
        embedMessage.description = `${song.name}\n\nDuration: ${song.formattedDuration}`
        embedMessage.footer.text = `Requested by: ${song.user.tag}`
        queue.textChannel.send(
            { embeds: [embedMessage] }
        ).then(msg => {
            setTimeout(() => 
                msg.delete(), songDurationMs
            )
        })
      
        console.log(`[ ChronicTune ] - Now Playing: ${song.name} (Requested by: ${song.user.tag})`)
        
    })
    .on("addSong", (queue, song) => {
        queue.textChannel.send(`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user.tag}`).then(msg => {
            setTimeout(() => msg.delete(), 5000)
        });
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send(`Added ${playlist.name} playlist to queue`).then(msg => {
            setTimeout(() => msg.delete(), 10000)
        })
    })
    .on("error", (channel, e) => {
        // channel.send(`An error encountered: ${e.toString().slice(0, 1974)}`)
        console.error(e)
    })
    .on("finish", queue => {
        console.log("[ ChronicTune ] - AFK timer started")
        clearTimeout(timer);
        timer = setTimeout(function(){
            console.log("[ ChronicTune ] - AFK 5 minutes")
            queue.textChannel.send("I got to get out of here, see you all later!").then(msg => {
                setTimeout(() => msg.delete(), 5000)
            })
            distube.voices.get(queue)?.leave()
            currentVoiceChannel = ''
            return    
        }, 300000 );
    })
    // .on("finishSong", queue => queue.textChannel.send("Finish song!"))
    .on("disconnect", queue => {queue.textChannel.send("I got to get out of here, see you all later!").then(msg => {
        setTimeout(() => msg.delete(), 5000)})
        currentVoiceChannel = ''
    })

    .on("empty", queue => queue.textChannel.send("Empty!"))
    // DisTubeOptions.searchSongs > 1
    // .on("searchResult", (message, result) => {
    //     let i = 0
    //     message.channel.send(
    //         `**Choose an option from below**\n${result
    //             .map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``)
    //             .join("\n")}\n*Enter anything else or wait 30 seconds to cancel*`
    //     ).then(msg => {
    //         setTimeout(() => msg.delete(), 10000)
    //     })
    // })
    // .on("searchCancel", message => message.channel.send(`Searching canceled`).then(msg => {
    //         setTimeout(() => msg.delete(), 5000)
    //     }))
    // .on("searchInvalidAnswer", message => message.channel.send(`Invalid number of result.`).then(msg => {
    //         setTimeout(() => msg.delete(), 5000)
    //     }))
    // .on("searchNoResult", message => message.channel.send(`No result found!`).then(msg => {
    //         setTimeout(() => msg.delete(), 5000)
    //     }))
    // .on("searchDone", () => {})

client.login(config.token)