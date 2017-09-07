//  etc
const Vote = require('./voteHandler.js');


//  This is used for shortcuts and memes;
export function handler(cli, message) {
  const demo = message.content.split(' ');
  //  Vote leftovers
  if(demo[1] === 'submit') {
    Vote.submit(cli, parseInt(demo[2]), message);
  }
  //  A shortcut to Demo vote num because its more intutive
  else if(demo[1] === 'results') {
    Vote.postResults(parseInt(demo[2]), message);
  }
  //  who doesn't want to bop
  else if(demo[1] === 'bop') {
    const channs = cli.guilds.get(message.guild.id).channels;
    const num = Math.floor(Math.random() * channs.get(message.channel.id).position);
    channs.get(message.channel.id).setPosition(num);
  }
}
