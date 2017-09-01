const Vote = require('./voteHandler.js');
const Admin = require('./adminHandler.js');
//const db = require('./database.js');

export default function (cli, message) {
	if(message.author.bot) {
		console.log('Someone is trying to Ddos');
		return;
	}
	const demo = message.content.split(' ');
	if(demo[1] === 'vote') {
		Vote.handler(cli, message);
	}
	if(demo[1] === 'admin') {
		Admin.handler(cli, message);
	}
	if(demo[1] === 'anarchy') {
		console.log('starting stuff');
		//db.getAnarchy().then((doc, err) => console.log(doc.anarchy));
	} /*

	if(demo[1] === 'b') {
		db.changeAnarchy('true').then((doc,err) => console.log(doc));
	}
	if(demo[1] === 'lag') {
		const f1 = (client) => {
			return client.guilds.get('344362648915148802').channels.get('346066272720650242').send('this response is truely truely, delayyed');
		};
		//	getMessage(message.channel,message.id).reply('hehe xd'); };
		// message.channel.id
		//const f = message.reply.bind(message, 'Hehe xd')
		const d = db.deserializeFunc(db.serializeFunc(f1));
		Vote.createNewVote(cli, message, 'send a msg', f1);

		//Vote.createNewVote(cli, message, 'Reply to a comment', f);
	}
	if(demo[1] === 'debug') {
		console.log(cli);
	}
	if(demo[1] === 'submit') {
		Vote.submit(cli, parseInt(demo[2]), message);
	}
	if(demo[1] === 'recus') {
		const f1 = (client) => {
			return client.guilds.get('344362648915148802').channels.get(message.channel.id);
		};
		//	getMessage(message.channel,message.id).reply('hehe xd'); };
		f1(cli).send('Demo recus');
	} */
}
