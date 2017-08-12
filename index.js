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

client.login('MzQ0MzY2NDAxMjUyNzUzNDQw.DGrwUg.fp_ATYKP7Ph_C9m3531A3PYpwvs');


function handler(cli, message) {
	if(message.content.split(' ')[1] === 'vote') {
		console.log('starting vote')
		console.log(message.content.split(' ').length);
		if(message.content.split(' ').length <= 2) {
			message.reply('use vote with a message pls');
			return;
		} else {
			message.reply('Started vote with ID: 1\n' + message.content.substring(message.content.indexOf('vote')+5) + ' vote 1 [yes] [no]');
		}
	}
	if(message.content.split(' ')[1] === 'stuff') {
		console.log('starting stuff');
	}
}