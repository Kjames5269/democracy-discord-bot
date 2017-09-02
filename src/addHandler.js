const Vote = require('./voteHandler.js');
const Anarchy = require('./anarchy.js');

export function handler(cli, message) {
  console.log('addHandler Starting');
  const addArr = message.content.split(' ');
  if(addArr[2] === 'channel') {
    addChannel(cli, message);
  }
}

function addChannel(cli, message) {
  const err = 'add channel [text|voice] [name]';
  const addArr = message.content.split(' ');

  if(addArr.length < 5) {
    message.reply(err);
    return;
  }

  const type = addArr[3];
  const name = addArr.slice(4).join(' ');
  if(type !== 'text' && type !== 'voice') {
    message.reply(err);
    return;
  }

  const existCheck = cli.guilds.get(message.guild.id).channels.find((chan) => {
    return chan.name === name && chan.type === type
  });

  if(existCheck != null) {
    message.reply('That channel already exist!');
    return;
  }

  Anarchy.check(cli, message).then((doc) => {
    if(doc) {
      createNewChannel(cli,message,null,type,name);
    }
    else {
      const arr = [];
      arr.push(type);
      arr.push(name);
      Vote.createNewVote(cli, message,
         'Create a new ' + type + ' channel named ' + name, createNewChannel, arr);
    }
  });
}

function createNewChannel(cli, message, db, type, name) {
  cli.guilds.get(message.guild.id).createChannel(name, type).then((doc, err) => {
    message.reply('created a new ' + type + ' channel:' + name);
  }).catch((err) => {
    message.reply('there was an error creating the channel');
    console.log(err);
  });
}
