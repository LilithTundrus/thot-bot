'use strict';                                                       // Allow less 'bad' code
// Custom requires/libs
const config = require('./config.js');                              // Conifg/auth data
const ver = '0.0.1';                                                // Arbitrary version for knowing which bot version is deployed
var reg = new RegExp(/^-?\d+\.?\d*$/);
let notNumOrCharReg = new RegExp(/^a-z0-9/);
const fs = require('fs');

// npm packages
var Discord = require('discord.io');                                // Discord API wrapper
var emoji = require('node-emoji');
const randomWord = require('random-word');
var randomWords = require('random-words');

//TODO: Add a better emojify handler (special characters)

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

bot.on('disconnect', function (evt) {
    console.log(`Bot DISCONNECTED at ${new Date().toISOString()}`);
    console.log('Attempting reconnect...');
    bot.connect();
    if (bot.connected == true) {
        console.log('Reconnected to Discord');
    } else {
        console.log('Reconnect failed...');
    }
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
                let randomNumberForEmojiMessage = getRandomInt(10, 20);
                let emojiMessage = randomEmojiSet(randomNumberForEmojiMessage);
                bot.sendMessage({
                    to: channelID,
                    message: emojiMessage,
                });
                break;
            case 'emojify':                                     // This is a stupid thing
                //turn a string into emoji regional indicators
                if (message.length < 9 || message.trim().length < 9) {
                    bot.sendMessage({
                        to: channelID,
                        message: 'Please give me a string to emojify',
                        typing: true
                    });
                } else {
                    let emojifyStr = message.substring(9).toLowerCase();
                    var emojiString = '';
                    for (var i = 0; i < emojifyStr.length; i++) {
                        if (emojifyStr.charAt(i) == ' ') {
                            emojiString = emojiString + ' '
                        } else if (emojifyStr.charAt(i) == 'b') {
                            emojiString = emojiString + ` :b: `
                        } else if (emojifyStr.charAt(i).match(reg)) {
                            emojiString = emojiString + `:${inWords(emojifyStr.charAt(i))}:`
                        } else if (emojifyStr.charAt(i).match(/[.,\/#!$%\^&\*';:{}=\-_`~()]/g)) {
                            emojiString = emojiString + emojifyStr.charAt(i)
                        } else {
                            emojiString = emojiString + ` :regional_indicator_${emojifyStr.charAt(i)}: `
                        }
                    }
                    console.log(emojiString)
                    bot.sendMessage({
                        to: channelID,
                        message: emojiString,
                    });
                }
            // Just add any case commands here
        }
    }
});


function randomEmojiSet(numberArg) {
    let emojiString = '';
    for (var i = 0; i < numberArg; i++) {
        emojiString = emojiString + `${randomWords()} :${emoji.random().key}: `;
    }
    return emojiString;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



function inWords(num) {
    if (num == 1) {
        return 'one'
    } else if (num == 2) {
        return 'two'
    } else if (num == 3) {
        return 'three'
    } else if (num == 4) {
        return 'four'
    } else if (num == 5) {
        return 'five'
    } else if (num == 6) {
        return 'six'
    } else if (num == 7) {
        return 'seven'
    } else if (num == 8) {
        return 'eight'
    } else if (num == 9) {
        return 'nine'
    } else if (num == 0) {
        return 'zero'
    }
}