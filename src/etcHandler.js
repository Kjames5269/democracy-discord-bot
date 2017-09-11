//  etc
const Vote = require('./voteHandler.js');
const Promise = require('bluebird');
const func = require('./func.js');
const db = require('./database.js');

const _timerPromises = [];
Promise.config({cancellation: true});

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
    if(_timerPromises[message.guild.id] != null) {
      message.reply('There is a timer already in progress in your server #designDecisions');
      return;
    }

    const msg = demo.splice(3).join(' ');
    const mins = parseInt(demo[2]);
    var millis = mins * 60 * 1000;
  //  chann.send('Timer: ' + msg + ' in ' + mins + ' minutes');
    db.addTimer(message.guild.id, chann.id, func.gatherMentions(cli, message, true));
    _timerPromises[message.guild.id] = {
      prom: promiseCreator(message.guild.id, chann, msg, millis, mins).then(() => {
        chann.send('Timer: ' + msg + ' happening now!\n@everyone');
        _timerPromises[message.guild.id] = null;
      }),
      msg: null
    }
  }
  else if(demoJ === 'Demo stop countdown') {
    if(_timerPromises[message.guild.id] == null) {
      message.reply('No timer in progress');
      return;
    }
    _timerPromises[message.guild.id].prom.cancel();
    message.reply('The timer has been stopped');
    _timerPromises[message.guild.id] = null;
    db.removeTimer(message.guild.id);
  }
  else if(demo[1] == 'debug') {
    func.gatherMentions(cli, message);
  }
  else if(demo[1] == 'here') {
    db.timerPullMem(message.guild.id, message.author.id);
    message.reply('Glad to have ya').then((greetings) => {
      greetings.delete(7000);
    });
    message.delete(7000);
    if(_timerPromises[message.guild.id]) {
      const content = _timerPromises[message.guild.id].msg.content.split('\n').slice(0,-1).join('\n');
      timerMsgPrep(message.guild.id, content).then((msg) => {
        _timerPromises[message.guild.id].msg.edit(msg);
      });
    }
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

function timerMsgPrep(guild, msg) {
  return db.getTimerStatus(guild).then((time) => {
    return time.members;
  }).then((members) => {
    const mentionStr = msg + '\n' + members.map((ele) => {
      return '<@' + ele + '>';
    }).join(' ');
    return mentionStr;
  });
}

function promiseCreator(guild, chann, msg, millis, mins) {
  const ob = getNextMin(millis, mins);
  const min = ob.min;
  const milli = ob.mil;
  const msgStr = 'Timer: ' + msg + ' in ' + min + ' minutes';
  return timerMsgPrep(guild, msgStr).then((mentionStr) => {
    chann.send(mentionStr).then((timerMessage) => {
      _timerPromises[guild].msg = timerMessage;
      timerMessage.delete(milli)
    });
    if(mins > 1) {
      return Promise.delay(milli, { guild: guild, chan:chann, msg: msg, milli: milli, min: ob.next }).then((doc) => {
        return promiseCreator(doc.guild, doc.chan, doc.msg, doc.milli, doc.min);
      });
    }
    else {
      return Promise.delay(millis);
    }
  });
}
