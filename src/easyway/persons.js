const express = require('express');
const mongodb = require('mongodb');
const logger = require('../serverlog/logger')
const router = express.Router();

// Get persons
router.get('/all', async (req, res, next) => {
  logger.info('fetch all posts from db');
  try{
    const persons = await loadPersonsCollection();
    res.send(await persons.find({}).toArray());
  } catch (err){
    res.status(500).send(err.message);
    next(err);
  }
});

// Add person
router.post('/add', async (req, res,next) => {
  logger.info('add new person: ' + req.body.person);
  try {
    const posts = await loadPersonsCollection();
    await posts.insertOne(
      req.body);
    res.status(201).send();
  } catch (err){
    logger.error("Add person to DB failed: " + err.message);
    next(err);
  }
});

// Delete Post
router.delete('/:id', async (req, res,next) => {
  logger.info('delete graphic: ' + req.params.id);
  try {
    const posts = await loadPersonsCollection();
    await posts.deleteOne({_id: new mongodb.ObjectID(req.params.id)});
    res.status(200).send();
  } catch (err){
    logger.error("Delete post failed: " + err.message);
    res.status(500).send(err.message);
    next(err);
  }
});

async function loadPersonsCollection() {
  try {
    const dbInstance = await mongodb.MongoClient.connect('mongodb://172.17.0.4:27017/easyway-db', {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db('easyway-db').collection('persons');
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}


module.exports = router;
