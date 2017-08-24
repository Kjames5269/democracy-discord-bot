const MongoClient = require('mongodb').MongoClient;
const Promise = require('bluebird');

const url='mongodb://localhost:27017/demo';

// just JS things... not sure why mongo doesn't
// like variable names but it tilts the hell outta me
function getCollection(db, collection) {
  if(collection === 'config') {
    return db.collection.call(db,'config');
  }
  if(collection === 'votes') {
    return db.collection.call(db,'votes');
  }
  return null;
}

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
      const col = getCollection(db, collection);
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

export function getA() {

	return base((col) => {
		return col.findOne.bind(col, {_id:'CONFIG'});
	}, 'config');
}

export function getAnarchy() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('config');
      col.findOne({_id:'CONFIG'},
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

export function changeAnarchy(to) {
  return new Promise((resolve, reject) => {
    if(to != 'true' && to != 'false' ) {
      reject('incorrect bool value');
      return;
    }
    MongoClient.connect(url, (err, db) => {
      const col = db.collection('config');
      col.updateOne({_id:'CONFIG'},
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


function getNewVoteID() {
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

export function addNewVote(voteMsg, onSuccessful) {
  return new Promise((resolve, reject) => {
    getNewVoteID().then((doc, err) => {
      const id = doc.value.lastVoteID;
      MongoClient.connect(url, (err, db) => {
        const col = db.collection('votes');
        col.insertOne(
          {
            '_id': id,
            'message': voteMsg,
            'users': [],
            'onSuccess': onSuccessful
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
