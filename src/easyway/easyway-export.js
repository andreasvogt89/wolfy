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
        let event = await Event.findOne({ _id: req.params.id });
        let persons = personData.filter(item => event.event.participants.includes(item._id));
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

router.get('/excel/persons', authenticateToken, async(req, res, next) => {
    logger.info(`get excel for all persons`);
    try {
        let personData = await Person.find({});
        let persons = personData.filter(item => item.person.firstname !== "#DUMMY");
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
        let worksheet = workbook.addWorksheet('Alle Personen');
        worksheet.addTable({
            name: 'Teilnehmer',
            ref: 'A3',
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
            eventTable.addRow([
                data.person.firstname,
                data.person.lastname,
                data.person.phone,
                data.person.emergency_phone,
                data.person.email,
                data.person.class,
                data.person.age,
                parseDate(data.person.birthdate),
                data.person.comments,
                data.person.gender,
                data.person.street,
                data.person.street_number,
                data.person.city,
                data.person.postcode,
            ], 0);
        });
        eventTable.commit();
        worksheet.getCell('A1').value = "Personen "
        worksheet.getRow(1).font = {
                size: 18,
                bold: true,
                family: 4,
            },
        worksheet.getCell('D1').value = 'Exportiert am: ' + new moment(new Date()).format('LL');
        worksheet.getCell('A2').value = 'Personen insegsamt:       ' + persons.length;
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

router.post('/excel/statistic', authenticateToken, async(req, res, next) => {
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
        let eventData = await Event.find(item => req.body.eventNames.includes(item.event.name));
        req.body.years = ["2021"];
        let events = eventData.filter(event => req.body.years.includes(new Date(event.event.eventDate).getFullYear().toString()));
        let workbook = new exceljs.Workbook();
        //worksheet Events
        let worksheetEvents = workbook.addWorksheet('Events');
        worksheetEvents.addTable({
            name: 'Events',
            ref: 'A5',
            headerRow: true,
            totalsRow: true,
            style: {
                theme: 'TableStyleDark4',
                showRowStripes: true,
            },
            columns: [
                { name: 'Name', filterButton: true },
                { name: 'Datum', filterButton: true },
                { name: 'Wo', filterButton: true },
                { name: 'Kommentar', filterButton: true },
                { name: 'Anzahl Personen', filterButton: true },
                { name: 'Anzahl Frauen', filterButton: true },
                { name: 'Anzahl Männer', filterButton: true },
                { name: 'Langendorf W', filterButton: true },
                { name: 'Langendorf M', filterButton: true },
                { name: 'Rüttenen W', filterButton: true },
                { name: 'Rüttenen M', filterButton: true },
                { name: 'Oberdorf W', filterButton: true },
                { name: 'Oberdorf M', filterButton: true },
                { name: 'Bellach W', filterButton: true },
                { name: 'Bellach M', filterButton: true },
                { name: 'Selzach W', filterButton: true },
                { name: 'Selzach M', filterButton: true },
                { name: 'Lommiswil W', filterButton: true },
                { name: 'Lommiswil M', filterButton: true },
                { name: 'Bettlach W', filterButton: true },
                { name: 'Bettlach M', filterButton: true },
                { name: 'Solothurn W', filterButton: true },
                { name: 'Solothurn M', filterButton: true },
                { name: 'Andere W', filterButton: true },
                { name: 'Andere M', filterButton: true },
                { name: 'Anzahl Kids', filterButton: true },
                { name: 'Anzahl Jugendtliche', filterButton: true },
            ],
            rows: [],
        });
        const eventTable = worksheetEvents.getTable('Events');
        events.forEach(data => {
            let places = countPersonsPerCity(data, personData);
            let row = [
                data.event.name,
                parseDate(data.event.eventDate),
                data.event.place,
                data.event.comments,
                data.event.participants.length,
                places.women,
                places.man,
                places.langendorfW,
                places.langendorfM,
                places.rüttenenW,
                places.rüttenenM,
                places.oberdorfW,
                places.oberdorfM,
                places.bellachW,
                places.bellachM,
                places.selzachW,
                places.selzachM,
                places.lommiswilW,
                places.lommiswilM,
                places.bettlachW,
                places.bettlachM,
                places.solothurnW,
                places.solothurnM,
                places.andereW,
                places.andereM,
                places.kids,
                places.teens,
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
            worksheetEvents.getCell('A3').value = 'Anzahl exportierte Events:       ' + events.length;
        await workbook.xlsx.writeFile('./exports/' + filename + '.xlsx').then(function() {
            logger.info('Excel file saved');
            res.download(path.join(__dirname, '../../exports/' + filename + '.xlsx'));
        });
    } catch (err) {
        logger.error(`Can't load collection: ${req.params.id} cause: ${err}`)
        next(err);
    }
});

function countPersonsPerCity(eventItem, personData) {
    let eventPersons = personData.filter(item => eventItem.event.participants.includes(item._id));
    let places = {
        man: 0,
        women: 0,
        kids: 0,
        teens:0,
        langendorfW: 0,
        rüttenenW: 0,
        oberdorfW: 0,
        bellachW: 0,
        selzachW: 0,
        lommiswilW: 0,
        bettlachW: 0,
        solothurnW: 0,
        andereW: 0,
        langendorfM: 0,
        rüttenenM: 0,
        oberdorfM: 0,
        bellachM: 0,
        selzachM: 0,
        lommiswilM: 0,
        bettlachM: 0,
        solothurnM: 0,
        andereM: 0,
    }
    eventPersons.forEach(item => {
        if (item.person.city === 'Langendorf' && item.person.gender === "W") {
            places.langendorfW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Langendorf' && item.person.gender === "M") {
            places.langendorfM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Rüttenen' && item.person.gender === "W") {
            places.rüttenenW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Rüttenen' && item.person.gender === "M") {
            places.rüttenenM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Oberdorf' && item.person.gender === "W") {
            places.oberdorfW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Oberdorf' && item.person.gender === "M") {
            places.oberdorfM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Bellach' && item.person.gender === "W") {
            places.bellachW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Bellach' && item.person.gender === "M") {
            places.bellachM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Selzach' && item.person.gender === "W") {
            places.selzachW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Selzach' && item.person.gender === "M") {
            places.selzachM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Lommiswil' && item.person.gender === "W") {
            places.lommiswilW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Lommiswil' && item.person.gender === "M") {
            places.lommiswilM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Bettlach' && item.person.gender === "W") {
            places.bellachW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Bettlach' && item.person.gender === "M") {
            places.bellachM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Solothurn' && item.person.gender === "W") {
            places.solothurnW++;
            places.women++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else if (item.person.city === 'Solothurn' && item.person.gender === "M") {
            places.solothurnM++;
            places.man++;
            if(item.person.age < 13){
                places.kids++    
                } else{
                    places.teens++   
                }
        } else {
            if (item.person.gender === 'W') {
                places.women++;
                places.andere++;
                if(item.person.age < 13){
                    places.kids++    
                    } else{
                        places.teens++   
                    }
            } else {
                places.man++;
                places.andere++;
                if(item.person.age < 13){
                    places.kids++    
                    } else{
                        places.teens++   
                    }
            }
        }
    });
    return places
}

function parseDate(date){
    if(date !== null){
     let newDate = new Date(date);
     moment.locale('de-ch');        
     return new moment(newDate).format('LL');
    } else {
      return ""
    }
}




module.exports = router;