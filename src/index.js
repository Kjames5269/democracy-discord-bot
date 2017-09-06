const Discord = require('discord.js');
const client = new Discord.Client();
import msgHandler from './messageHandler.js';

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
		msgHandler(client,message);
	}
});

client.login('MzQ0MzY2NDAxMjUyNzUzNDQw.DGrwUg.fp_ATYKP7Ph_C9m3531A3PYpwvs');
