const express = require('express');
const logger = require('../serverlog/logger');
const router = express.Router();
const { Event, Person, schemaName } = require('../mongodb');
const { authenticateToken } = require('../auth');
const { asyncForEach } = require('../utils/functions');
const { roles } = require('../userdb');

/**
 * Get db Collection as array
 * Headers = {Collection = ""}
 */
router.get('/collection', authenticateToken, async(req, res, next) => {
    logger.info('fetch all ' + req.headers.collection + ' from db');
    try {
        //perhabs this could be done less often
        await recalCalculateAge();
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
        await model.create(req.body).then(doc => {
            newID = doc._id
        });
        res.status(201).send({ newID });
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
        let changedID = ""
        await model.updateOne({ _id: req.params.id }, { $set: req.body });
        res.status(200).send({ changedID });
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
        if (req.user.role === roles.ADMIN) {
            await deleteDependendItems(req.params.id, req.headers.collection);
            const model = getMongooseModel(req.headers.collection);
            await model.deleteOne({ _id: req.params.id });
            res.status(200).send();
        } else {
            res.status(401).send({ message: 'Permission denied' });
        }
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

async function recalCalculateAge() {
    const personModel = getMongooseModel(schemaName.PERSON);
    let persons = await personModel.find({});
    asyncForEach(persons, async(personItem) => {
        if (personItem.person.firstname !== "#DUMMY" || personItem.person.birthdate !== "") {
            let ageDifMs = Date.now() - new Date(personItem.person.birthdate).getTime();
            let ageDate = new Date(ageDifMs);
            personItem.person.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            await personModel.updateOne({ _id: personItem._id }, { $set: personItem });
        }
    });
}


async function deleteDependendItems(id, model) {
    //get de inverse collection to delete the depencies
    const personModel = getMongooseModel(schemaName.PERSON);
    const eventModel = getMongooseModel(schemaName.EVENT);
    try {
        if (model === schemaName.EVENT) {
            let toDeleteEvent = await eventModel.find({ _id: id });
            await asyncForEach(toDeleteEvent[0].event.participants, async(personID) => {
                let personItem = await personModel.find({ _id: personID });
                if (personItem[0].person.firstname === '#DUMMY') {
                    await personModel.deleteOne({ _id: personItem[0]._id });
                }
            });
        } else {
            let events = await eventModel.find({});
            await asyncForEach(events, async(eventItem) => {
                if (eventItem.event.participants.includes(id)) {
                    eventItem.event.participants.splice(eventItem.event.participants.indexOf(id), 1);
                    await eventModel.updateOne({ _id: eventItem._id }, { $set: eventItem });
                }
            });
        }
    } catch (error) {
        logger.error("Delete refreshing crashed: " + error)
    }
}

module.exports = router;