const express = require('express');
const logger = require('../serverlog/logger');
const router = express.Router();
const { Event, Person, schemaName } = require('../mongodb');
const { authenticateToken } = require('../auth');

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collection', authenticateToken, async (req, res, next) => {
  logger.info('fetch all ' + req.headers.collection + ' from db');
  try {
    const model = getMongooseModel(req.headers.collection);
    res.send(await model.find({}));
  } catch (err) {
    logger.error(`Can't load collection: ${req.headers.collection} cause: ${err}`)
    next(err);
  }
});

/**
 * Add data to DB
 * Body = Entry object
 * Headers = {collection = ""}
 */
router.post('/add', authenticateToken, async (req, res, next) => {
  logger.info(`add object to ${req.headers.collection}`);
  try {
    const model = getMongooseModel(req.headers.collection);
    await model.create(req.body);
    if (req.headers.collection === schemaName.PERSON) {
      await refreshEventsDB(req.body);
    }
    res.status(201).send();
  } catch (err) {
    logger.error('add to db failed: ' + err.message);
    next(err);
  }
});


/**
 * Change data in DB
 * Body = Object only with changed properties
 * Headers = {collection = ""}
 */
router.put('/change/:id', authenticateToken, async (req, res, next) => {
  logger.info(`change in ${req.headers.collection} this -> ${req.params.id}`);
  try {
    const model = getMongooseModel(req.headers.collection);
    await model.updateOne({ _id: req.params.id }, { $set: req.body });
    if (req.headers.collection === schemaName.PERSON) {
      await refreshEventsDB(req.body);
    }
    res.status(200).send();
  } catch (err) {
    logger.error('change failed: ' + err.message);
    next(err);
  }
});

/**
 * Delete mongodb entry
 * Headers = {collection = ""}
 */
router.delete('/delete/:id', authenticateToken, async (req, res, next) => {
  logger.info(`delete in collection ${req.headers.collection} this -> ${req.params.id}`);
  try {
    const model = getMongooseModel(req.headers.collection);
    await model.deleteOne({ _id: req.params.id });
    await deleteDependendItems(req.params.id, req.headers.collection);
    res.status(200).send();
  } catch (err) {
    logger.error("Delete object failed: " + err.message);
    next(err);
  }
});

function getMongooseModel(modelName) {
  if (modelName === schemaName.EVENT) {
    return Event
  } else {
    return Person
  }
}

async function deleteDependendItems(id, model) {
  //get de inverse collection to delete the depencies
  if (model === schemaName.EVENT) {
    const model = getMongooseModel(schemaName.PERSON);
    let persons = await model.find({});
    persons.forEach(personItem => {
      personItem.event = personItem.event.filter(item => item._id !== id);
      await model.updateOne({ _id: personItem._id }, { $set: personItem });
    });
  } else {
    const model = getMongooseModel(schemaName.EVENT);
    let events = await model.find({});
    events.forEach(eventItem => {
      eventItem.event.participants.splice(eventItem.event.participants.indexOf(id), 1);
      await model.updateOne({ _id: eventItem._id }, { $set: eventItem });
    });
  }
}

async function refreshEventsDB(person) {
  try {
    const eventModel = getMongooseModel(schemaName.EVENT);
    let events = await eventModel.find({});
    events.forEach(element => {
      if (person.event.includes(element._id) && !element.event.participants.includes(person._id)) {
        element.event.participants.push(person._id);
      } else if (element.event.participants.includes(person._id)) {
        element.event.participants.splice(element.event.participants.indexOf(person._id), 1);
      }
      await model.updateOne({ _id: element._id }, { $set: element });
    });
  } catch (error) {

  }

}


module.exports = router;
