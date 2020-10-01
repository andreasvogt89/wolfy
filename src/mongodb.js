const mongodb = require('mongodb');
const dbURL = 'mongodb://172.17.0.5:27017';


async function loadCollection(collectionName, dbName) {
  try {
    const dbInstance = await mongodb.MongoClient.connect(dbURL, {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db(dbName).collection(collectionName);
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}

async function getCollectionNames(dbName) {
  try {
    const dbInstance = await mongodb.MongoClient.connect(dbURL, {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db(dbName).listCollections({}).toArray();
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}

module.exports = {
  loadCollection,
  getCollectionNames,
}
