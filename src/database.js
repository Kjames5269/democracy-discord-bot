const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird');

const url='mongodb://localhost:27017/demo';

export function getAnarchy(disID) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('config');
      col.findOne({_id: disID},
      (err,doc) => {
        db.close();
        if(err === null) {
          resolve(doc.anarchy);
        }
        else {
          reject(err);
        }
      });
    });
  });
};

export function changeAnarchy(to, disID) {
  return new Promise((resolve, reject) => {
    if(to != 'true' && to != 'false' ) {
      reject('incorrect bool value');
      return;
    }
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('config');
      col.updateOne({_id: disID},
      { $set: { anarchy: to }},
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


function getNewVoteID(disID) {
  console.log('getVoteID starting');
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('config');
      col.findOneAndUpdate({_id: disID},
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

export function addNewVote(voteMsg, onSuccessful, disID) {
  return new Promise((resolve, reject) => {
    getNewVoteID(disID).then((doc, err) => {
      const id = doc.value.lastVoteID;
      MongoClient.connect(url, (err, db) => {
        const col = db.collection('votes');
        col.insertOne(
          {
            '_id': id,
            'message': voteMsg,
            'users': [],
            'onSuccess': onSuccessful,
            'config': disID
          },
          {},
          (err, doc) => {
            db.close();
            //  console.log(err);
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
