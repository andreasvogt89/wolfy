const express = require('express');
const mongodb = require('mongodb');
const logger = require('../serverlog/logger')
const router = express.Router();
const dbURL = 'mongodb://192.168.0.220:27017/easyway-db';
const dbName = 'easyway-db';

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collectionNames', async (req, res, next) => {
  try{
    let collections = await getCollectionNames();
    res.send(collections.map(collections => collections.name));
  } catch (err){
    next(err);
  }
});

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collection', async (req, res, next) => {
  logger.info('fetch all {0} from db', req.headers.collection);
  try{
    const collection = await loadCollection(req.headers.collection);
    res.send(await collection.find({}).toArray());
  } catch (err){
    next(err);
  }
});

/**
 * Add data to DB
 * Body = Entry object
 * Headers = {collection = ""}
 */
router.post('/add', async (req, res,next) => {
  logger.info('add to {0} this -> {1}', req.headers.collection, req.body);
  try {
    const collection = await loadCollection(req.headers.collection);
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
 * Headers = {collection = ""}
 */
router.delete('/:id', async (req, res,next) => {
  logger.info('delete {1} this @ {0}', req.headers.collction, req.body);
  try {
    const collection = await loadCollection(req.headers.collection);
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
