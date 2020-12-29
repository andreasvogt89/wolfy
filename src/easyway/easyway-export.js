const express = require('express');
const router = express.Router();
const logger = require('../serverlog/logger');
const path = require('path');
const exceljs = require('exceljs');
const { authenticateToken } = require('../auth');
const { Event, Person } = require('../mongodb');
const moment = require('moment');
moment.locale('de-ch');

router.get('/excel/event/:id', authenticateToken, async(req, res, next) => {
    logger.info(`get excel for event: ${req.params.id}`);
    try {
        let personData = await Person.find({});
        let persons = personData.filter(personItem => isIncluded(req.params.id,personItem.person.event));
        let event = await Event.findOne({ _id: req.params.id });
        const filename = req.headers.filename
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + filename + ".xlsx"
        );
        let workbook = new exceljs.Workbook();
        let worksheet = workbook.addWorksheet('event');
        worksheet.addTable({
            name: 'Teilnehmer',
            ref: 'A5',
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleDark4',
                showRowStripes: true,
            },

            columns: [
                { name: 'Vorname', filterButton: true },
                { name: 'Nachname', filterButton: true },
                { name: 'Handy', filterButton: true },
                { name: 'Notfallnummer', filterButton: true },
                { name: 'Mail', filterButton: true },
                { name: 'Klasse', filterButton: true },
                { name: 'Alter', filterButton: true },
                { name: 'Geburtsdatum', filterButton: true },
                { name: 'Kommentar', filterButton: true },
                { name: 'Geschlecht', filterButton: true },
                { name: 'Strasse', filterButton: true },
                { name: 'Strassenummer', filterButton: true },
                { name: 'Ort', filterButton: true },
                { name: 'Postleizahl', filterButton: true },
            ],
            rows: [],
        });
        const eventTable = worksheet.getTable('Teilnehmer');
        persons.forEach(data => {
            let newDate = new Date(data.person.birthdate);
            eventTable.addRow([
                data.person.firstname,
                data.person.lastname,
                data.person.phone,
                data.person.emergency_phone,
                data.person.email,
                data.person.class,
                data.person.age,
                new moment(newDate).format('LL'),
                data.person.comments,
                data.person.gender,
                data.person.street,
                data.person.street_number,
                data.person.city,
                data.person.postcode,
            ], 0);
        });
        eventTable.commit();
        worksheet.getRows(1, 4).height = 30;
        worksheet.getCell('A1').value = event.event.name;
        worksheet.getCell('A1').font = {
                size: 18,
                bold: true,
                family: 4,
            },
            worksheet.getCell('A2').value = 'In: ' + event.event.place;
        let newDate = new Date(event.event.eventDate);
        worksheet.getCell('A3').value = 'Am: ' + new moment(newDate).format('LL');
        worksheet.getCell('B1').value = "Kommentare:";
        worksheet.mergeCells('B2:C4');
        worksheet.getCell('C2').value = event.event.comments;
        worksheet.getCell('D2').value = 'Personen insegsamt:       ' + persons.length;
        worksheet.columns = [
            { key: 'Vorname', width: 20 },
            { key: 'Nachname', width: 20 },
            { key: 'Handy', width: 20 },
            { key: 'Notfallnummer', width: 20 },
            { key: 'Mail', width: 20 },
            { key: 'Klasse', width: 20 },
            { key: 'Alter', width: 20 },
            { key: 'Geburtsdatum', width: 20 },
            { key: 'Kommentar', width: 20 },
            { key: 'Geschlecht', width: 20 },
            { key: 'Strasse', width: 20 },
            { key: 'Strassenummer', width: 20 },
            { key: 'Ort', width: 20 },
            { key: 'Postleizahl', width: 20 },
        ];
        await workbook.xlsx.writeFile('./exports/' + filename + '.xlsx').then(function() {
            logger.info('Excel file saved');
            res.download(path.join(__dirname, '../../exports/' + filename + '.xlsx'));
        });
    } catch (err) {
        logger.error(`Can't load collection: ${req.params.id} cause: ${err}`)
        next(err);
    }
});



router.post('/excel/persons', authenticateToken, async(req, res, next) => {
    logger.info(`get excel for all persons`);
    try {
        const filename = req.headers.filename
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + filename + ".xlsx"
        );
        let personData = await Person.find({});
        let eventData = await Event.find({});
        let events = eventData.filter(item => req.body.eventNames.includes(item.event.name));
        let persons = personData.filter(item => isIncluded(item._id, events));
        let _columnsPersons = [
            { name: 'Vorname', filterButton: true },
            { name: 'Nachname', filterButton: true },
            { name: 'Handy', filterButton: true },
            { name: 'Notfallnummer', filterButton: true },
            { name: 'Mail', filterButton: true },
            { name: 'Klasse', filterButton: true },
            { name: 'Alter', filterButton: true },
            { name: 'Geburtsdatum', filterButton: true },
            { name: 'Kommentar', filterButton: true },
            { name: 'Geschlecht', filterButton: true },
            { name: 'Strasse', filterButton: true },
            { name: 'Strassenummer', filterButton: true },
            { name: 'Ort', filterButton: true },
            { name: 'Postleizahl', filterButton: true },
        ];
        events.forEach(item=>{
            _columnsPersons.push({
                name: item.event.name,
                filterButton: true,
                });    
        });
        let workbook = new exceljs.Workbook();
        let worksheetPersons = workbook.addWorksheet('Personen');
        worksheetPersons.addTable({
            name: 'Persons',
            ref: 'A5',
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleDark4',
                showRowStripes: true,
            },
            columns: _columnsPersons,
            rows: [],
        });
        const personTable = worksheetPersons.getTable('Persons');
        persons.forEach(data => {
            let newDate = new Date(data.person.birthdate);
            let row = [
                data.person.firstname,
                data.person.lastname,
                data.person.phone,
                data.person.emergency_phone,
                data.person.email,
                data.person.class,
                data.person.age,
                new moment(newDate).format('LL'),
                data.person.comments,
                data.person.gender,
                data.person.street,
                data.person.street_number,
                data.person.city,
                data.person.postcode,
            ];
            events.forEach(item=>{
                if(isIncluded(item._id,data.person.event)){
                    row.push("Ja");
                } else {
                    row.push("Nein")
                }
            });
            personTable.addRow(row, 0);
        });
        personTable.commit();
        worksheetPersons.getRows(1, 4).height = 30;
        worksheetPersons.getCell('A1').value = "Personen";
        worksheetPersons.getCell('A1').font = {
                size: 18,
                bold: true,
                family: 4,
            },
        worksheetPersons.getCell('D2').value = 'Personen insgesamt:       ' + persons.length;
        
        //worksheet Events
        let worksheetEvents = workbook.addWorksheet('Events');
        worksheetEvents.addTable({
            name: 'Events',
            ref: 'A5',
            headerRow: true,
            totalsRow: false,
            style: {
                theme: 'TableStyleDark5',
                showRowStripes: true,
            },
            columns: [
                { name: 'Name', filterButton: true },
                { name: 'Datum', filterButton: true },
                { name: 'Wo', filterButton: true },
                { name: 'Kommentar', filterButton: true },
                { name: 'Anzahl Personen', filterButton: true },
            ],
            rows: [],
        });
        const eventTable = worksheetEvents.getTable('Events');
        events.forEach(data => {
            let newDate = new Date(data.event.eventDate);
            let row = [
                data.event.name,
                new moment(newDate).format('LL'),
                data.event.place,
                data.event.comments,
                data.event.participants.length,
            ];
            eventTable.addRow(row, 0);
        });
        eventTable.commit();
        worksheetEvents.getRows(1, 4).height = 30;
        worksheetEvents.getCell('A1').value = "Events";
        worksheetEvents.getCell('A1').font = {
                size: 18,
                bold: true,
                family: 4,
            },
        worksheetEvents.getCell('D2').value = 'Events insgesamt:       ' + events.length;
        await workbook.xlsx.writeFile('./exports/' + filename + '.xlsx').then(function() {
            logger.info('Excel file saved');
            res.download(path.join(__dirname, '../../exports/' + filename + '.xlsx'));
        });
    } catch (err) {
        logger.error(`Can't load collection: ${req.params.id} cause: ${err}`)
        next(err);
    }
});

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