const db = require('./database.js');
const Vote = require('./voteHandler.js');

function setAnarchy(cli, message, val) {
  db.getGuildSettings(message.guild.id).then((doc, err) => {
    if(doc.anarchy == val) {
      if(val) {
        message.reply('anarchy mode is already enabled');
      }
      else {
        message.reply('democracy is already enabled');
      }
      return;
    }
    console.log(doc.statusLocked);
    if(doc.statusLocked != false) {
      message.reply('Vote already in progress with id: ' + doc.statusLocked);
      return;
    }
    if(val) {
      Vote.createNewVote(cli, message, 'Set mode to anarchy', (cli, message, db) => {
        db.changeAnarchy(true, message.guild.id).then((doc, err) => {
          db.setLockStatus(message.guild.id, false).then((doc,err) => {
            message.reply('Anarchy mode is now on!');
          });
        });
      }).then((doc,err) => {
        db.setLockStatus(message.guild.id, doc);
      });
    }
    else {
      Vote.createNewVote(cli, message, 'Set mode to democracy', (cli, message, db) => {
        db.changeAnarchy(false, message.guild.id).then((doc, err) => {
          db.setLockStatus(message.guild.id, false).then((doc,err) => {
            message.reply('Democracy mode is now on!');
          });
        });
      }).then((doc,err) => {
        db.setLockStatus(message.guild.id, doc);
      });
    }
  });
}

export function on(cli, message) {
  setAnarchy(cli, message, true);
}

export function off(cli, message) {
  setAnarchy(cli, message, false);
}

export function check(cli, message) {
  return db.getGuildSettings(message.guild.id).then((doc, err) => {
    return doc.anarchy;
  });
}

export function mode(cli, message) {
  check(cli, message).then((doc, err) => {
    if(doc) {
      message.reply('current mode: anarchy');
    }
    else {
      message.reply('current mode: democracy');
    }
  });
}
