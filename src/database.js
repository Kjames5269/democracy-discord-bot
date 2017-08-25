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

export function getAnarchy() {
  return base((col) => {
    return col.findOne.bind(col, {_id:'CONFIG'});
  }, 'config');
};

/* if(to != 'true' && to != 'false' ) {
  reject('incorrect bool value');
  return;
} */

export function changeAnarchy(to) {
  return base((col) => col.updateOne.bind(col,
    {_id:'CONFIG'},
    { $set: { anarchy: to }}),
    'config');
};


function getNewVoteID() {
  console.log('getVoteID starting');
  return base((col) => col.findOneAndUpdate.bind(col,
    {_id:'CONFIG'},
    { $inc: {'lastVoteID': 1}},
    { returnOriginal: false }),
    'config');
};

export function addNewVote(voteMsg, onSuccessful) {
  return getNewVoteID().then((doc, err) => {
    const id = doc.value.lastVoteID;
    return base((col) => col.insertOne.bind(col,
      {
        '_id': id,
        'message': voteMsg,
        'users': [],
        'onSuccess': onSuccessful
      }), 'votes');
  });
}

export function voteOn(id, userID, vote) {
  return base((col) => col.findOneAndUpdate.bind(col,
    { '_id': id },
    { $pull: { 'users': { uid: userID }}}),
    'votes').then((doc,err) => {
    return base((col) => col.findOneAndUpdate.bind(col,
      { '_id': id },
      { $addToSet: { 'users': { uid: userID, vote: vote}}}),
      'votes')
  });
}

export function getResults(id) {
  return base((col) => col.findOne.bind(col,
    { '_id': id }), 'votes');
}


export function serializeFunc(pFunc) {
  return BSON.serialize({func: pFunc}, {serializeFunctions: true});
}
export function deserializeFunc(stream) {
  return BSON.deserialize(stream, {evalFunctions: true});
}
