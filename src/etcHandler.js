//  etc
const Vote = require('./voteHandler.js');
const Promise = require('bluebird');

//  This is used for shortcuts and memes;
export function handler(cli, message) {
  const demo = message.content.split(' ');
  const demoJ = message.content;
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
  else if(demoJ === 'Demo EVERYONE GET IN HERE') {
    const users = cli.guilds.get(message.guild.id).members;
    const channs = cli.guilds.get(message.guild.id).channels.filter((chan) => {
      return chan.type === 'voice';
    });
    const v = channs.random();
    users.forEach((user) => {
      user.setVoiceChannel(v.id);
    });
  }
  else if(demo[1] === 'countdown') {
    const chann = cli.guilds.get(message.guild.id).channels.get(message.channel.id);
    if(demo.length < 4 || isNaN(demo[2])) {
      message.reply('countdown <numberInMinutes> <msg>');
      return;
    }
    const msg = demo.splice(3).join(' ');
    const mins = parseInt(demo[2]);
    var millis = mins * 60 * 1000;
  //  chann.send('Timer: ' + msg + ' in ' + mins + ' minutes');

    promiseCreator(chann, msg, millis, mins).then(() => {
      chann.send('Timer: ' + msg + ' happening now!');
    });
  }
  //chann.createInvite() => returns invite
}

function getNextMin(millis, mins) {
  if((millis/2) > 5 * 60 * 1000) {
    return { mil: millis / 2, min: millis / 1000 / 60, next: millis / 1000 / 60 / 2 };
  }
  if((millis/2) >= 3 * 60 * 1000) {
    return { mil: millis - (5 * 60 * 1000), min: millis / 1000 / 60, next: 5 };
  }
  if(mins == 5) {
    return { mil: 2 * 1000 * 60, min: 5, next: 3 };
  }
  if(mins <= 3) {
    return { mil: 1 * 1000 * 60, min: mins, next: mins -1 };
  }
  console.log('NANI');
  return { mil: millis / 2, min: millis / 1000 / 60 };
}

function promiseCreator(chann, msg, millis, mins) {
  const ob = getNextMin(millis, mins);
  const min = ob.min;
  const milli = ob.mil;
  chann.send('Timer: ' + msg + ' in ' + min + ' minutes');
  if(mins > 1) {
    return Promise.delay(milli, {chan:chann, msg: msg, milli: milli, min: ob.next}).then((doc) => {
      return promiseCreator(doc.chan, doc.msg, doc.milli, doc.min);
    });
  }
  else {
    return Promise.delay(millis);
  }
}
