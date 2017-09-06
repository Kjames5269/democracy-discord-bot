const Vote = require('./voteHandler.js');
const Admin = require('./adminHandler.js');
const db = require('./database.js');
const Anarchy = require('./anarchy.js');
const Add = require('./addHandler.js');
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
		if(demo[1] === 'admin') {
			Admin.handler(cli, message);
		}
		if(demo[1] === 'anarchy') {
			Anarchy.on(cli, message);
		}
		if(demo[1] === 'democracy') {
			Anarchy.off(cli, message);
		}
		if(demo[1] === 'mode') {
			Anarchy.mode(cli, message);
		}
		if(demo[1] === 'add') {
			Add.handler(cli, message);
		}
		//  Vote leftovers
		if(demo[1] === 'submit') {
			Vote.submit(cli, parseInt(demo[2]), message);
		}
		//  A shortcut to Demo vote num because its more intutive
		if(demo[1] === 'results') {
			Vote.postResults(parseInt(demo[2]), message);
		}
	});
}
