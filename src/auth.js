

export default function (cli, message) {
  const guildId = message.guild.id;
  const userId = message.author.id;
  const adminArr = message.content.split(' ');
  const role = cli.guilds.get(guildId).members.get(userId).roles.get('353057405682319371');
  if(role == null) {
    message.reply('invalid permissions');
    return false;
  }
  return true;
};
