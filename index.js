const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log('Ready Sirrrrrr.');
});

client.on('message', message => {
	if(message.content === 'ping' ) {
		message.reply('pong mofo');
	}
});

client.login('MzQ0MzY2NDAxMjUyNzUzNDQw.DGrwUg.fp_ATYKP7Ph_C9m3531A3PYpwvs');
