const Vote = require('./voteHandler.js');

export default function (cli, message) {
	const demo = message.content.split(' ');
	if(demo[1] === 'vote') {
		Vote.handler(cli, message);
	}
	if(demo[1] === 'anarchy') {
		console.log('starting stuff');
	}
	if(demo[1] === 'init') {
		console.log(message.channel.guild.id);
	}
}
