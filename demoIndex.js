const Discord = require('discord.js');
const client = new Discord.Client();
const MessageHandler = require('./messageHandler.js');

client.on('ready', () => {
console.log('Ready Sirrrrrr.');
});

const demo = new RegExp('^Demo *');

client.on('message', message => {
if(message.channel.name === 'constitution') {
if(!message.author.bot) {
message.author.send('Yo nerd, you cannot post in ' + message.channel.name + ' as it is offlimits to the likes of you');
message.delete();
}
}
const temp = message.content.match(demo);
if(temp) {
handler(client,message);
}
});

client.on('messageDeleted', message => {
console.log('messageDeleted');
if(message.channel.name === 'constitution') {
client.sendMessage(message.channel.id, message.content);
}
});


client.login('MzQ0MzY2NDAxMjUyNzUzNDQw.DGrwUg.fp_ATYKP7Ph_C9m3531A3PYpwvs');


function handler(cli, message) {
const split = message.content.split(' ');
if(split[1] === 'vote') {
console.log('starting vote')
console.log(split.length);
if(split.length <= 2) {
message.reply('vote is used as follows: \nvote "message" to start a vote\nvote voteID [yes, no]');
return;
} else if (isNaN(split[2])) {
message.reply('Started vote with ID: 1\n' + message.content.substring(message.content.indexOf('vote')+5) + ' vote 1 [yes] [no]');
} else{
if(split[2] === 'yes') {
message.reply('DB write yes with user ID ' + message.author.id);
}
else if(split[2] === 'no') {
message.reply('DB write no with user ID ' + message.author.id);
}
else {
message.reply('Current vote DB read');
}
}
}
if(split[1] === 'stuff') {
console.log('starting stuff');
}
}
