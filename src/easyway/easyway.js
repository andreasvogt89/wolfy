const express = require('express');
const mongodb = require('mongodb');
const logger = require('../serverlog/logger')
const router = express.Router();
const dbURL = 'mongodb://192.168.0.220:27017/easyway-db';
const dbName = 'easyway-db';

/**
 * Get db Collection as array
 * Headers = {CollectionName = ""}
 */
router.get('/collectionNames', async (req, res, next) => {
  try{
    res.send(await getCollectionNames());
  } catch (err){
    next(err);
  }
});

/**
 * Get db Collection as array
 * Headers = {CollectionName = ""}
 */
router.get('/collection', async (req, res, next) => {
  logger.info('fetch all {0} from db', req.headers.collctionName);
  try{
    const collection = await loadCollection(req.headers.collctionName);
    res.send(await collection.find({}).toArray());
  } catch (err){
    next(err);
  }
});

/**
 * Add data to DB
 * Body = Entry object
 * Headers = {collectionName = ""}
 */
router.post('/add', async (req, res,next) => {
  logger.info('add to {0} this -> {1}', req.headers.collctionName, req.body);
  try {
    const collection = await loadCollection();
    await collection.insertOne(
      req.body);
    res.status(201).send();
  } catch (err){
    logger.error('add to db failed: {0}',err.message);
    next(err);
  }
});

/**
 * Delete mongodb entry
 * Headers = {collectionName = ""}
 */
router.delete('/:id', async (req, res,next) => {
  logger.info('delete {1} this @ {0}', req.headers.collctionName, req.body);
  try {
    const collection = await loadCollection(req.headers.collectionName);
    await collection.deleteOne({_id: new mongodb.ObjectID(req.params.id)});
    res.status(200).send();
  } catch (err){
    logger.error("Delete object failed: {0}", err.message);
    next(err);
  }
});

async function loadCollection(collectionName) {
  try {
    const dbInstance = await mongodb.MongoClient.connect(dbURL, {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db(dbName).collection(collectionName);
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}

async function getCollectionNames() {
  try {
    const dbInstance = await mongodb.MongoClient.connect(dbURL, {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db(dbName).listCollections({}).toArray();
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}


module.exports = router;
