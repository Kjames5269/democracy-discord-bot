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
      'give the nickname ',
      'add nickname <mentionUser> <nickName> ',
      addNickname
    );
  }
  if(addArr[2] === 'role') {
    addWithMentions(cli, message,
      'give the role ',
      'add role <mentionUser> <mentionedRole>',
      addRole,
      (cli, message, name) => {
          const role1 = name.split('&')[1];
          if(role1 == null) {
            return false;
          }
          const roleId = role1.split('>')[0];
          return cli.guilds.get(message.guild.id).roles.get(roleId) != null;
      }
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

function addWithMentions(cli, message, voteMsg, errMsg, f, boolFunc) {
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

  if(boolFunc != null) {
    if(!boolFunc(cli, message, name)) {
      message.reply(errMsg + ' (something could not be found)');
      return;
    }
  }

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

function addRole(cli, message, db, role) {
  const args = [...params];
  const ids = args.slice(4);
  console.log(ids);
  const members = cli.guilds.get(message.guild.id).members.filter((usr) => {
    return ids.includes(usr.id);
  });

  const roleId = role.split('&')[1].split('>')[0];

  if(cli.guild.get(message.guild.id).roles.get(roleId) == null) {
    message.reply('the role has been deleted or removed. Cannot complete your request');
    return;
  }

  members.forEach((ele) => {
    ele.addRole(roleId, 'Voted on by the masses').catch((err) => {
      console.log(err);
    });
  });
}

function addNickname(cli, message, db, nickName) {
  const args = [...params];
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
