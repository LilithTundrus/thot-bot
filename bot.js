'use strict';                                                       // Allow less 'bad' code
// Custom requires/libs
const config = require('./config.js');                              // Conifg/auth data
const ver = '0.0.0022';                                             // Arbitrary version for knowing which bot version is deployed
const fs = require('fs');
// npm packages
var Discord = require('discord.io');                                // Discord API wrapper

var bot = new Discord.Client({                                      // Initialize Discord Bot with config.token
    token: config.discordToken,
    autorun: true
});

bot.on('ready', function (evt) {                                    // Do some logging and start ensure bot is running
    console.log('Connected to Discord...');
    console.log(`Logged in as: ${bot.username} - (${bot.id})`);
    console.log(`Bot version ${ver} started at ${new Date().toISOString()}`);
    bot.setPresence({                                               // Make the bot 'play' soemthing
        idle_since: null,                                           // Set this to Date.now() to make the bot appear as away
        game: { name: 'Memes' }
    });
});


bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '%') {                           // Listen for messages that will start with `^`
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        // Log any messages sent to the bot to the console and to file for debugging
        fs.appendFileSync('discordMessagelog.log', `${user} sent: ${message} at ${Date.now()}`);
        console.log(`${user} sent: ${message} at ${new Date().toISOString()}`);
        args = args.splice(1);
        switch (cmd) {                                              // Bot needs to know if it will execute a command
            case 'random':                                          // Only command ever needed
            bot.sendMessage({
                to: channelID,
                message: AAAAAAAAAAAA,
                typing: true
            });
                break;
            // Just add any case commands here
        }
    }
});