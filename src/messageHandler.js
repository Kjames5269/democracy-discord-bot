const Vote = require('./voteHandler.js');

export default function (cli, message) {
	if(message.author.bot) {
		console.log('Someone is trying to Ddos');
		return;
	}
	const demo = message.content.split(' ');
	if(demo[1] === 'vote') {
		Vote.handler(cli, message);
	}
	if(demo[1] === 'anarchy') {
		console.log('starting stuff');
	}
}
