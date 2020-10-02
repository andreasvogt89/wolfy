const express = require('express');
const mongodb = require('mongodb');
const logger = require('../serverlog/logger')
const router = express.Router();
const { getCollectionNames, loadCollection } = require('../mongodb');
const dbName = 'easyway-db';
const { authenticateToken } = require('../auth');

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collectionNames', authenticateToken, async (req, res, next) => {
  try{
    let collections = await getCollectionNames(dbName);
    res.send(collections.map(collections => collections.name));
  } catch (err){
    next(err);
  }
});

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collection',authenticateToken, async (req, res, next) => {
  logger.info('fetch all {0} from db', req.headers.collection);
  try{
    const collection = await loadCollection(req.headers.collection,dbName);
    res.send(await collection.find({}).toArray());
  } catch (err){
    logger.error("Can't load collection: {0} cause: {1}", req.headers.collection, err)
    next(err);
  }
});

/**
 * Add data to DB
 * Body = Entry object
 * Headers = {collection = ""}
 */
router.post('/add', authenticateToken, async (req, res,next) => {
  logger.info('add to {0} this -> {1}', req.headers.collection, req.body);
  try {
    const collection = await loadCollection(req.headers.collection,dbName);
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
router.delete('/:id', authenticateToken, async (req, res,next) => {
  logger.info('delete {1} this @ {0}', req.headers.collction, req.body);
  try {
    const collection = await loadCollection(req.headers.collection,dbName);
    await collection.deleteOne({_id: new mongodb.ObjectID(req.params.id)});
    res.status(200).send();
  } catch (err){
    logger.error("Delete object failed: {0}", err.message);
    next(err);
  }
});




module.exports = router;
