const Vote = require('./voteHandler.js');
const Admin = require('./adminHandler.js');
const db = require('./database.js');
const Anarchy = require('./anarchy.js');
const Add = require('./addHandler.js');
const AndEtc = require('./etcHandler');
import auth from './auth.js';

export default function (cli, message) {
	if(message.author.bot) {
		console.log('Someone is trying to Ddos');
		return;
	}
	auth(cli, message).then((doc, err) => {
		console.log(doc);
		if(!doc) {
			return;
		}
		const demo = message.content.split(' ');
		if(demo[1] === 'vote') {
			Vote.handler(cli, message);
		}
		else if(demo[1] === 'admin') {
			Admin.handler(cli, message);
		}
		else if(demo[1] === 'anarchy') {
			Anarchy.on(cli, message);
		}
		else if(demo[1] === 'democracy') {
			Anarchy.off(cli, message);
		}
		else if(demo[1] === 'mode') {
			Anarchy.mode(cli, message);
		}
		else if(demo[1] === 'add') {
			Add.handler(cli, message);
		}
		else {
			AndEtc.handler(cli,message);
		}
	});
}
