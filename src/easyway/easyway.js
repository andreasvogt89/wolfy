const express = require('express');
const mongodb = require('mongodb');
const logger = require('../serverlog/logger')
const router = express.Router();
const { Event, Person, schemaName } = require('../mongodb');
const { authenticateToken } = require('../auth');

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collection',authenticateToken, async (req, res, next) => {
  logger.info('fetch all ' + req.headers.collection + ' from db');
  try{
    const model = getMongooseModel(req.headers.collection);
    res.send(await model.find({}));
  } catch (err){
    logger.error(`Can't load collection: ${req.headers.collection} cause: ${err}`)
    next(err);
  }
});

/**
 * Add data to DB
 * Body = Entry object
 * Headers = {collection = ""}
 */
router.post('/add', authenticateToken, async (req, res,next) => {
  logger.info(`add object to ${req.headers.collection}`);
  try {
    const model = getMongooseModel(req.headers.collection);
    await model.create(req.body)
    res.status(201).send();
  } catch (err){
    logger.error('add to db failed: ' + err.message);
    next(err);
  }
});

//TODO Change not finished
/**
 * Change data in DB
 * Body = Object only with changed properties
 * Headers = {collection = "", type = ""}
 */
router.put('/change/:id', authenticateToken, async (req, res,next) => {
  logger.info(`change in ${req.headers.collection} this -> ${req.params.id}`);
  try {
   // const collection = await loadCollection(req.headers.collection,dbName);
    for (const [key, value] of Object.entries(req.body[req.headers.object])) {
      await collection.updateOne({_id: new mongodb.ObjectID(req.params.id)},{$set:{[key]: value}});
    }
    res.status(200).send();
  } catch (err){
    logger.error('change failed: ' + err.message);
    next(err);
  }
});

/**
 * Delete mongodb entry
 * Headers = {collection = ""}
 */
router.delete('/delete/:id', authenticateToken, async (req, res,next) => {
  logger.info(`delete in collection ${req.headers.collection} this -> ${req.params.id}`);
  try {
    const model = getMongooseModel(req.headers.collection);
    await model.deleteOne({_id: req.params.id});
    res.status(200).send();
  } catch (err){
    logger.error("Delete object failed: " + err.message);
    next(err);
  }
});

function getMongooseModel(modelName) {
  if(modelName === schemaName.EVENT){
    return Event
  } else {
    return Person
  }
}


module.exports = router;
