const Vote = require('./voteHandler.js');
const Anarchy = require('./anarchy.js');

export function handler(cli, message) {
  console.log('addHandler Starting');
  const addArr = message.content.split(' ');
  if(addArr[2] === 'channel') {
    addChannel(cli, message);
  }
  if(addArr[2] === 'nickname') {
    addWithMentions(cli, message,
      'give the nickname ',  //TODO
      'add nickname <mentionUser> <nickName> ',
      addNickname
    );
  }
}

function gatherMentions(cli, message) {
  if(message.mentions.everyone) {
    return cli.guilds.get(message.guild.id).members.map((usr) => {
      return usr.id;
    });
  }
  return message.mentions.users.map((usr) => {
    return usr.id;
  });
}

function addWithMentions(cli, message, voteMsg, errMsg, f) {
  const addArr = message.content.split(' ');
  if(addArr.length < 5 ) {
    message.reply(errMsg)
    return;
  }
  const mentions = gatherMentions(cli, message);
  if(mentions.length === 0) {
    message.reply(errMsg);
    return;
  }
  //console.log(mentions);
  var len = mentions.length;
  if(message.mentions.everyone) {
    len = 1;
  }
  const name = addArr.slice(3 + len).join(' ');
  const mentionStr = mentions.map((ele) => {
    return '<@' + ele + '>';
  }).join(' ');


  Anarchy.check(cli, message).then((doc) => {
    if(doc) {
      f(cli,message,null,name,...mentions);
    }
    else {
      const arr = [name, ...mentions];
      Vote.createNewVote(cli, message,
         voteMsg + name + ' to ' + mentionStr, f, arr);
    }
  });
}

function addNickname(cli, message, db, nickName) {
  const args = [...arguments];
  const ids = args.slice(4);
  console.log(ids);
  const members = cli.guilds.get(message.guild.id).members.filter((usr) => {
    return ids.includes(usr.id);
  });

  members.forEach((ele) => {
    ele.setNickname(nickName, 'Voted on by the masses').catch((err) => {
      console.log(err);
      if(err.code === 50035) {
        message.reply('Your nickname must be 32 or fewer characters in length');
      }
    });
  });
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
