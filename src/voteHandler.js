const db = require('./database.js');
const Promise = require('bluebird');
import auth from './auth.js';

const errMsg = 'vote is used as follows: \nvote "message" to start a vote\nvote voteID [yes, no]';
const VOTE_ID_S = 2; //  Vote ID slot
const VOTE_S = 3     //  Vote slot

export function createNewVote(cli, message, voteMsg, success, params) {
  return db.addNewVote(voteMsg, message.guild.id, success, params).then((doc, err) => {
    const voteID = doc.ops[0]._id;
    message.reply('Started vote with ID: ' + voteID + '\n'
    + voteMsg + '\nvote ' + voteID + ' [string]');
    return voteID;
  }).catch(e => {
    message.reply('There was a problem starting the vote at this time');
    console.log('Caught error during insertOne');
    console.log(e);
  });
}

export function handler(cli, message) {
  console.log('starting vote')
  const voteArr = message.content.split(' ');

  if(voteArr.length <= 2) {
    message.reply(errMsg);
    return;
  }
  else if (isNaN(voteArr[VOTE_ID_S])) {
    createNewVote(cli, message, message.content.substring(message.content.indexOf('vote')+5));
  }
  else if (voteArr.length > 3) {
    preVote(voteArr[VOTE_ID_S], voteArr.slice(VOTE_S).join(' '), message);
  }
  else if (voteArr.length == 3) {
    if(isNaN(voteArr[VOTE_ID_S])) {
      message.reply(errMsg);
    }
    else {
      postResults(parseInt(voteArr[VOTE_ID_S]),message);
    }
  }
  else {
    console.log(voteArr);
    message.reply(errMsg);
  }
};

function preVote(voteID, vote, message) {
  if(isNaN(voteID)) {
    message.reply('vote id [string]. help for more');
  }
  else {
    db.voteOn(parseInt(voteID), message.author.id, message.guild.id, vote).then((doc, err) => {
      postResults(parseInt(voteID),message);
    });
  }
}

function countVotes(poll) {
  var finalpoll = {};

  for(var i = 0; i < poll.length; i++) {
    if(finalpoll[poll[i].vote] == null) {
      finalpoll[poll[i].vote] = 1;
    }
    else {
      finalpoll[poll[i].vote] += 1;
    }
  }
  return finalpoll;
}

function stringify (voteMsg, obj) {
  var str = voteMsg + ': ';
  for (var i in obj) {
    str += obj[i] + ' ' + i + ', ';
  }
  return str.substring(0, str.length - 2);
}

function postResults(voteID, message) {
  db.getResults(voteID, message.guild.id).then((doc, err) => {
    //console.log(doc);
    if(doc === null) {
      //  invalid vote number
      message.reply('No votes in your channel found with ID ' + voteID);
      return
    }

    message.reply(stringify(doc.message, countVotes(doc.users)));
  });
}

export function submit(cli, voteID, message) {
  console.log('starting submit with id: ' + voteID);
  db.getResults(voteID, message.guild.id).then((doc, err) => {
    if(doc === null) {
      //  invalid vote number
      message.reply('No votes found with ID ' + voteID);
      return;
    }
    if(doc.onSuccess === null) {
      message.reply('There is nothing to submit with this vote');
      return;
    }
    if(doc.passed) {
      message.reply('This vote has already been passed');
      return;
    }

    db.getGuildSettings(message.guild.id).then((doc2, err) => {
      const guildId = message.guild.id;
      const guild = cli.guilds.get(guildId);

      const totalVoters = cli.guilds.get(guildId).members.filter((usr) => {
        return usr.roles.get(doc2.roleId)
      }).array().length;

      const neededToPass = (doc2.percentToPass * .01 * totalVoters).toFixed(2);
      const yeses = countVotes(doc.users).yes || 0;

      if(yeses > neededToPass) {
        message.reply('Vote ' + voteID + ' passed!');
        const f = db.deserializeFunc(doc.onSuccess.buffer);
        db.passedVote(voteID).then((doc3, err) => {
          if(doc.params == null) {
            f(cli, message, db);
          }
          else {
            f(cli, message, db, ...doc.params);
          }
        });
      }
      else {
        message.reply(stringify(doc.message, countVotes(doc.users)) + ' , you need '
          + neededToPass + ' yeses to pass. Only have ' + yeses);
      }
    });
  });
}
