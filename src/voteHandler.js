const db = require('./database.js');
const Promise = require('bluebird');

const errMsg = 'vote is used as follows: \nvote "message" to start a vote\nvote voteID [yes, no]';
const VOTE_ID_S = 2;
const VOTE_S = 3

export function createNewVote(cli, message, voteMsg, success) {
  db.addNewVote(voteMsg, success).then((doc, err) => {
    const voteID = doc.ops[0]._id;
    message.reply('Started vote with ID: ' + voteID + '\n'
    + voteMsg + '\nvote ' + voteID + ' [yes] [no]');
  }).catch(e => {
    message.reply('There was a problem starting the vote at this time');
    console.log('Caught error during insertOne');
    console.log(e);
  });
}

export function handler(cli, message) {
  console.log('starting vote')
  const voteArr = message.content.split(' ');

  console.log(voteArr.length);
  if(voteArr.length <= 2) {
    message.reply(errMsg);
    return;
  }
  else if (isNaN(voteArr[VOTE_ID_S])) {
    createNewVote(cli, message, message.content.substring(message.content.indexOf('vote')+5));
  }
  else if (voteArr.length <= 4 ) {
    if(voteArr[VOTE_S] === 'yes') {
      preVote(voteArr[VOTE_ID_S], voteArr[VOTE_S], message);
    }
    else if(voteArr[VOTE_S] === 'no') {
      preVote(voteArr[VOTE_ID_S], voteArr[VOTE_S], message);
    }
    else {
      if(isNaN(voteArr[VOTE_ID_S])) {
        message.reply(errMsg);
      }
      else {
        postResults(parseInt(voteArr[VOTE_ID_S]),message);
      }
    }
  }
  else {
    console.log(voteArr);
    message.reply(errMsg);
  }
};

function preVote(voteID, vote, message) {
  if(isNaN(voteID)) {
    message.reply('vote id [yes],[no]. help for more');
  }
  else {
    db.voteOn(parseInt(voteID), message.author.id, vote).then((doc, err) => {
      //console.log(doc);
      //console.log(err);
      postResults(parseInt(voteID),message);
    });
  }
}

function postResults(voteID, message) {
  db.getResults(voteID).then((doc, err) => {
    //console.log(doc);
    if(doc === null) {
      //  invalid vote number
      message.reply('No votes found with ID ' + voteID);
      return
    }

    const users = doc.users;
    var yes = 0;
    var no = 0;

    for(var i = 0; i < users.length; i++) {
      if(users[i].vote === 'yes') {
        yes += 1;
      }
      else if( users[i].vote === 'no') {
        no += 1;
      }
    }

    message.reply(doc.message + ': ' + yes + ' for, ' + no + ' against');
  });
}

export function submit(cli, voteID) {
  console.log('starting submit with id: ' + voteID);
  db.getResults(voteID).then((doc, err) => {
    console.log(doc);
    if(doc === null) {
      //  invalid vote number
      message.reply('No votes found with ID ' + voteID);
      return
    }
    const f = db.deserializeFunc(doc.onSuccess.buffer);
    f(cli);
  });
}
