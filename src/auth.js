const db = require('./database.js');
const Promise = require('bluebird');

export default function (cli, message) {
  const guildId = message.guild.id;
  const userId = message.author.id;
  const guild = cli.guilds.get(guildId);

  //  Server admin always has access
  if(guild.ownerID == userId) {
    return new Promise((res, rej) => {
      res(true);
    });
  }

  return db.getGuildSettings(guildId).then((doc, err) => {
    const role = cli.guilds.get(guildId).members.get(userId).roles.get(doc.roleId);
    if(role == null) {
      message.reply('invalid permissions');
      return false;
    }
    return true;
  }).catch((err) => {
    message.reply('Uninitialized value. Have your server owner type admin init [voting role] [percentToPass(1-100)]');
    return false;
  });
};
