const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird');

const url='mongodb://localhost:27017/demo';

export function getNewVoteID() {
  console.log('getVoteID starting');
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('config');
      col.findOneAndUpdate({_id:'CONFIG'},
      { $inc: {'lastVoteID': 1}},
      { returnOriginal: false },
      (err,doc) => {
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
};

export function addNewVote(id, voteMsg) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('votes');
      col.insertOne(
        {
          '_id': id,
          'message': voteMsg,
          'users': []
        },
        {},
        (err, doc) => {
          db.close();
          if(err === null) {
            resolve(doc)
          }
          else {
            reject(err);
          }
        }
      );
    });
  });
};

export function voteOn(id, userID, vote) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('votes');
      console.log('updating id: ' + id + ' with vote ' + vote);
      col.findOneAndUpdate(
        { '_id': id },
        { $pull: { 'users': { uid: userID }}},
        (err, doc) => {
          col.findOneAndUpdate(
            { '_id': id },
            { $addToSet: { 'users': { uid: userID, vote: vote}}},
            (err, doc) => {
              db.close();
              if(err === null) {
                resolve(doc);
              }
              else {
                reject(err);
              }
            }
          );
        }
      );
    });
  });
}

export function getResults(id) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('votes');
      col.findOne({ '_id': id }, (err, doc) => {
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
