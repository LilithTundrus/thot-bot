'use strict';                                                       // Allow less 'bad' code
// Custom requires/libs
const config = require('./config.js');                              // Conifg/auth data
const ver = '0.2.0';                                                // Arbitrary version for knowing which bot version is deployed
const fs = require('fs');

// npm packages
var Discord = require('discord.io');                                // Discord API wrapper
var emoji = require('node-emoji');
var randomWords = require('random-words');
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
                        } else if (emojifyStr.charAt(i).match(/\d/)) {
                            emojiString = emojiString + ` :${inWords(emojifyStr.charAt(i))}: `;
                        } else if (emojifyStr.charAt(i).match(/^[a-zA-Z]+$/g)) {
                            emojiString = emojiString + ` :regional_indicator_${emojifyStr.charAt(i)}: `
                        } else {
                            emojiString = emojiString + emojifyStr.charAt(i);
                        }
                    }
                    if (emojiString.length < 1999) {
                        bot.sendMessage({
                            to: channelID,
                            message: emojiString,
                        });
                    } else {
                        let arrayOfMessageChunks = createTextChunksBySpaces(emojiString)
                        return createMessageTail(channelID, 0, arrayOfMessageChunks);
                    }
                }
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

// Recursive
function createMessageTail(channelIDArg, chunkIndexStart, chunkedMessageArr) {
    let chunkingObj = addChunksUntilLimit(chunkedMessageArr, chunkIndexStart);
    if (chunkingObj.lastCompletedChunkIndex <= chunkedMessageArr.length) {
        // Wait a small amount of time to avoid the messages sending out of order
        return wait(1.5)
            .then(() => {
                bot.simulateTyping(channelIDArg);
                bot.sendMessage({
                    to: channelIDArg,
                    message: chunkingObj.chunkString
                });
                return createMessageTail(channelIDArg, chunkingObj.lastCompletedChunkIndex, chunkedMessageArr);
            })
            .catch((err) => {
                console.log(err);
            })
    } else {
        // End the loop, but still wait to make sure these send correctly
        return wait(1.5)
            .then(() => {
                bot.sendMessage({
                    to: channelIDArg,
                    message: chunkingObj.chunkString
                });
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// this is pretty hacky but works for emoji-based needs
function inWords(num) {
    switch (num) {
        case '1':
            return 'one';
        case '2':
            return 'two';
        case '3':
            return 'three';
        case '4':
            return 'four';
        case '5':
            return 'five';
        case '6':
            return 'six';
        case '7':
            return 'seven';
        case '8':
            return 'eight';
        case '9':
            return 'nine';
        case '0':
            return 'zero';
    }
}

/**
 * Add chunks of a string until a limit is reached (1,000 + the last string)
 * @param {Array<string>} arrayOFChunkStrings 
 * @param {Number} startIndex 
 * @returns {Object}
 */
function addChunksUntilLimit(arrayOFChunkStrings, startIndex) {
    let returnObj = {};
    let chunkStr = '';
    for (const [index, chunk] of arrayOFChunkStrings.entries()) {
        if (index < startIndex) {
            // do nothing
        } else {
            if (chunkStr.length < 1800) {
                chunkStr += ` ${chunk} `;
            } else {
                returnObj.lastCompletedChunkIndex = index;
                break;
            }
        }
    }
    // Always make sure we return the string
    returnObj.chunkString = chunkStr;
    return returnObj;
}


function createTextChunksBySpaces(string) {
    return string.split(`  `);
}

/**
 * @param {number} timeArg time (in seconds) to wait, holding the main call stack
 * @returns {promise}
 */
function wait(timeArg) {
    return new Promise((resolve) => {
        setTimeout(function () {
            resolve('Promise resolved!!');
        }, timeArg * 1000);
    });
}