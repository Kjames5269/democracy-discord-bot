const Vote = require('./voteHandler.js');
import auth from './auth.js';
const db = require('./database.js');

export function handler(cli, message) {
  console.log('starting admin duties')
  if(!auth(cli, message)) {
    return;
  }
  const adminArr = message.content.split(' ');

  if(adminArr[2] === 'init') {
    init(cli,message);
  }


}

function init(cli, message) {
  const guildId = message.guild.id;
  const userId = message.author.id;
  const guild = cli.guilds.get(guildId);

  if(guild.ownerID != userId) {
    message.reply('This can only be called by the server owner');
    return;
  }

  const adminArr = message.content.split(' ');
  if(adminArr.length != 4) {
    message.reply('Please give the name of the role you want to allow to vote');
    return;
  }

  const role = adminArr[3];
  const finRole = guild.roles.find((val) => val.name === role);

  if(finRole == null) {
    message.reply('could not find ' + role)
    return;
  }

  const roleId = finRole.id;
  db.initializeWithRole(guildId, roleId).then((doc, err) => {
    message.reply('Init success! Voters: ' + role +', anarchy: false');
  }).catch((err) => {
    message.reply('Resetting to new defaults! Voters: ' + role +', anarchy: false');
    db.reset(guildId, roleId);
  });
};
