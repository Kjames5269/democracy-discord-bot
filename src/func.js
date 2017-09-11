const Discord = require('discord.js');

export function gatherMentions(cli, message, force) {
  const guild = cli.guilds.get(message.guild.id);
  const chan = guild.channels.get(message.channel.id);

  if(message.mentions.everyone || force) {
    return guild.members.filter((usr) => {
      return chan.permissionsFor(usr).has(Discord.Permissions.FLAGS.READ_MESSAGES);
    }).map((usr) => {
      return usr.id;
    });
  }
  return message.mentions.users.map((usr) => {
    return usr.id;
  });
}
