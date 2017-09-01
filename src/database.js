const MongoClient = require('mongodb').MongoClient;
const bson = require('bson');
const BSON = new bson();
const Promise = require('bluebird');

const url='mongodb://localhost:27017/demo';

/* * * * *
 * Base:
 * Takes 2 args, a function that takes the collection and returns
 * a bound func with the appropriate query called on it.
 * The second is the name of the collection
 *
 * Returns a promise;
 *
 * Ex: base((col) => {
 *   return col.findOne.bind(col, {_id:'CONFIG'});
 * }, 'config');))
 */

function base(queryFunc, collection) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection(collection);
      const abst = queryFunc(col);
      abst((err,doc) => {
        db.close();
        if(err === null) {
          resolve(doc);
        }
        else {
          reject(err);
        }
      });
    });
  });
}

// guild settings

export function changeAnarchy(to, guildId) {
  return base((col) => col.updateOne.bind(col,
    {_id: guildId},
    { $set: { anarchy: to }}),
    'guildConfig');
};

export function getGuildSettings(guildId) {
  return base((col) => {
    return col.findOne.bind(col, {_id: guildId});
  }, 'guildConfig');
};

export function setLockStatus(guildId, lock) {
  return base((col) => col.updateOne.bind(col,
    {_id: guildId},
    { $set: { statusLocked: lock}}),
    'guildConfig');
}

//  initializations
/* id: guild ID discord makes it unique
   roleId: the id of the roll that is allowed to vote
   anarchy: are actions voted on before happening
   percentToPass: what percent needs to vote yes for a action to occur
   statusLocked: When true a anacrhy or demo vote cannot be started
*/
export function initializeWithRole(guildId, roleId, percent) {
  return base((col) => {
    return col.insertOne.bind(col,
      {_id: guildId, roleId: roleId, anarchy: false, percentToPass: percent , statusLocked: false});
  }, 'guildConfig');
};

export function reset(guildId, roleId, percent) {
  return base((col) => col.updateOne.bind(col,
    {_id: guildId},
    { $set: { roleId: roleId, anarchy: false, percentToPass: percent, statusLocked: false}}),
    'guildConfig');
};

//  Votes of all kinds

function getNewVoteID() {
  console.log('getVoteID starting');
  return base((col) => col.findOneAndUpdate.bind(col,
    {_id:'CONFIG'},
    { $inc: {'lastVoteID': 1}},
    { returnOriginal: false }),
    'config');
};

export function addNewVote(voteMsg, guildId, onSuccessful) {
  const onSuc = serializeFunc(onSuccessful);
  return getNewVoteID().then((doc, err) => {
    const id = doc.value.lastVoteID;
    return base((col) => col.insertOne.bind(col,
      {
        '_id': id,
        'message': voteMsg,
        'users': [],
        'guildId': guildId,
        'onSuccess': onSuc,
        'passed': false
      }), 'votes');
  });
}

export function voteOn(id, userID, guildId, vote) {
  return base((col) => col.findOneAndUpdate.bind(col,
    { '_id': id, guildId: guildId },
    { $pull: { 'users': { uid: userID }}}),
    'votes').then((doc,err) => {
    return base((col) => col.findOneAndUpdate.bind(col,
      { '_id': id, guildId: guildId },
      { $addToSet: { 'users': { uid: userID, vote: vote}}}),
      'votes');
  });
}

export function passedVote(id) {
  return base((col) => col.findOneAndUpdate.bind(col,
    { '_id': id }, {$set: { 'passed': true }}
  ),'votes');
}

export function getResults(id, guildId) {
  return base((col) => col.findOne.bind(col,
    { '_id': id, guildId: guildId }), 'votes');
}


//  Serializing functions

export function serializeFunc(pFunc) {
  if(pFunc === null) {
    return null;
  }
  return BSON.serialize({func: pFunc}, {serializeFunctions: true});
}

export function deserializeFunc(stream) {
  return BSON.deserialize(stream, {evalFunctions: true}).func;
}
