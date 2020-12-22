const express = require('express');
const logger = require('../serverlog/logger');
const router = express.Router();
const { Event, Person, schemaName } = require('../mongodb');
const { authenticateToken } = require('../auth');
const { asyncForEach } = require('../utils/functions');

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collection', authenticateToken, async(req, res, next) => {
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
router.post('/add', authenticateToken, async(req, res, next) => {
    logger.info(`add object to ${req.headers.collection}`);
    try {
        const model = getMongooseModel(req.headers.collection);
        let newID = ""
        await model.create(req.body).then(res => {
            newID = res._id;
        })
        if (req.headers.collection === schemaName.PERSON) {
            await refreshEventsDB(newID, req.body);
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
router.put('/change/:id', authenticateToken, async(req, res, next) => {
    logger.info(`change in ${req.headers.collection} this -> ${req.params.id}`);
    try {
        const model = getMongooseModel(req.headers.collection);
        await model.updateOne({ _id: req.params.id }, { $set: req.body });
        if (req.headers.collection === schemaName.PERSON) {
            await refreshEventsDB(req.params.id, req.body);
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
router.delete('/delete/:id', authenticateToken, async(req, res, next) => {
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
    try {
        if (model === schemaName.EVENT) {
            const personModel = getMongooseModel(schemaName.PERSON);
            let persons = await personModel.find({});
            console.log(persons)
            asyncForEach(persons, async(personItem) => {
                personItem.person.event = personItem.person.event.filter(item => item._id !== id);
                await personModel.updateOne({ _id: personItem._id }, { $set: personItem });
            });
        } else {
            const eventModel = getMongooseModel(schemaName.EVENT);
            let events = await eventModel.find({});
            asyncForEach(events, async(eventItem) => {
                eventItem.event.participants.splice(eventItem.event.participants.indexOf(id), 1);
                await eventModel.updateOne({ _id: eventItem._id }, { $set: eventItem });
            });
        }
    } catch (error) {
        logger.error("Delete refreshing crashed: " + error)
    }
}

async function refreshEventsDB(id, body) {
    try {
        const eventModel = getMongooseModel(schemaName.EVENT);
        let events = await eventModel.find({});
        asyncForEach(events, async(element) => {
            if (isIncluded(element._id, body.person.event) && !element.event.participants.includes(id)) {
                element.event.participants.push(id.toString());
            } else if (!isIncluded(element._id, body.person.event) && element.event.participants.includes(id)) {
                element.event.participants.splice(element.event.participants.indexOf(id), 1);
            }
            await eventModel.updateOne({ _id: element._id }, { $set: element });
        });
    } catch (error) {
        logger.error("Event refreshing crashed: " + error)
    }
}

function isIncluded(id, personEvents) {
    let answer = false;
    personEvents.forEach(item => {
        if (item._id == id) {
            answer = true;
        }
    });
    return answer;
}


module.exports = router;