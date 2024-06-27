// Import necessary modules
require('dotenv').config();
const { Client, GatewayIntentBits, Intents, MessageEmbed, VoiceConnectionStatus } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');

// Initialize Discord client
// const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent ],
});
// Bot token from environment variable
const { TOKEN } = process.env;

// Bot command prefix
const prefix = 'leeroy!';

// Target user for the bot to follow
let target = null;

// Voice related variables
let voiceConnection = null;
let isTalking = false;
let dispatcher = null;

// Flag to control bot on/off state
let onOff = true;

// Bot commands
const Commands = {
  'target': {
    help: 'Set the person that Leeroy will target. Usage: leeroy!target @Jenkins . Must @ (mention) a valid user.',
    execute: async (message) => {
      if (message.mentions.users.size < 1) {
        message.reply('Must mention a valid user.');
      } else {
        target = message.mentions.users.first().id;
        checkForUserInVoice();
        if (!target) {
          message.reply('Please provide a valid user.');
        }
      }
    }
  },
  'stop': {
    help: 'Turn Leeroy off.',
    execute: () => {
      if (voiceConnection) {
        voiceConnection.destroy();
        voiceConnection = null;
      }
      onOff = false;
    }
  },
  'start': {
    help: 'Turn Leeroy on.',
    execute: () => {
      console.log('we started')
      onOff = true;
      checkForUserInVoice();
    }
  },
  'help': {
    help: 'List commands for Leeroy.',
    execute: (message) => {
      let helpMessage = new MessageEmbed()
      .setTitle('Leeroy Bot Help');
      
      for (const key in Commands) {
        helpMessage.addField(`${prefix}${key}`, Commands[key].help);
      }
      message.channel.send(helpMessage);
    }
  }
};

// Client ready event
client.on('ready', () => {
  console.log('Sheeeshhhhhhhhhhhh');
});

// Message event listener
client.on('messageCreate', (message) => {
  console.log(message.content)
  if (message.content.startsWith(prefix)) {
    const cmd = message.content.substr(prefix.length).split(' ')[0];
    if (Commands[cmd]) {
      Commands[cmd].execute(message);
    } else {
      message.reply('Command not found, use "leeroy!help" to see commands.');
    }
  }
});

// Voice state update event listener
// TODO: when a user is already in a channel and they are targeted afterwards,
//  The bot doesn't join the channel (Even if they move channels)
//  They have to disconnect (leave the channel) and then connect again
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (oldState.member.id === target && newState.member.id === target && onOff) {
    try {
      if (!oldState.channelId && newState.channel) {
        const connection = joinVoiceChannel({
          channelId: newState.channel.id,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
          selfDeaf: false,  // Ensure bot is not deafened
          selfMute: false   // Ensure bot is not muted
        });
        
        voiceConnection = connection;
        // connection.subscribe(audioPlayer);
        
        connection.receiver.speaking.on('start', (userId) => {
          console.log(`User ${userId} has started speaking`);
          isTalking = true;
          play(voiceConnection);
        })
        
        connection.receiver.speaking.on('end', (userId) => {
          console.log(`User ${userId} has stopped speaking.`);
          isTalking = false;
          stop(voiceConnection);
        });
        
      } else if (oldState.channelId && !newState.channel) {
        if (voiceConnection) {
          voiceConnection.destroy();
          voiceConnection = null;
        }
      } else if (oldState.channelId && newState.channelId && voiceConnection) {
        const connection = joinVoiceChannel({
          channelId: newState.channelId,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
          selfDeaf: false,  // Ensure bot is not deafened
          selfMute: false   // Ensure bot is not muted
        });
        
        voiceConnection = connection;
        connection.subscribe(audioPlayer);
      }
    } catch (error) {
      console.error('Error joining voice channel:', error);
    }
  }
});


// Function to play audio
const player = createAudioPlayer({});
const play = async (connection) => {
  console.log('play')
  const resource = createAudioResource('./leeroy.mp3');
  player.play(resource);
  // Subscribes the connection to the player, the audio from the player will be transmitted to the connection.
  connection.subscribe(player);
  
  // Event listener for when the player goes idle (finished playing)
  player.on(AudioPlayerStatus.Idle, () => {
    if (isTalking) {
      // console.log('Track finished, replaying because flag is true.');
      player.play(createAudioResource('./leeroy.ogg'));
    } else {
      // console.log('Track finished, not replaying because flag is false.');
    }
  });
};

const stop =  async (connection) => {
  console.log('stop')
  player.stop(true);
  connection.subscribe(player);
};

// Function to check if target user is in voice channel
const checkForUserInVoice = () => {
  const voiceChannels = client.guilds.cache.map(guild => guild.channels.cache.filter(c => c.type === 'GUILD_VOICE'));
  console.log(voiceChannels)
  for (const channels of voiceChannels) {
    for (const channel of channels.values()) {
      if (channel.members.has(target)) {
        channel.join().then(connection => {
          voiceConnection = connection;
          connection.subscribe(audioPlayer);
        }).catch(console.error);
        return;
      }
    }
  }
  
  if (voiceConnection) {
    voiceConnection.destroy();
    voiceConnection = null;
  }
};

// Login using bot token
client.login(TOKEN);
