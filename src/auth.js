const db = require('./database.js');

export default function (cli, message) {
  const guildId = message.guild.id;
  const userId = message.author.id;
  const guild = cli.guilds.get(guildId);

  //  Server admin always has access
  if(guild.ownerID == userId) {
    return true;
  }

  db.getGuildSettings(guildId).then((doc, err) => {
    const role = cli.guilds.get(guildId).members.get(userId).roles.get(doc.roleId);
    if(role == null) {
      message.reply('invalid permissions');
      return false;
    }
    return true;
  });
};
