const express = require('express');
const router = express.Router();
const logger = require('../serverlog/logger');
const path = require('path');
const exceljs = require('exceljs');
const { authenticateToken } = require('../auth');
const { Event, Person } = require('../mongodb');
const moment = require('moment');
const { data } = require('../serverlog/logger');

router.get('/excel/:id', authenticateToken, async(req, res, next) => {
    logger.info(`get excel for event: ${req.params.id}`);
    try {
        const persons = await Person.find({
            ['person.event']: req.params.id
        });
        const event = await Event.findOne({ _id: req.params.id });
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
        worksheet.getCell('A3').numFmt = 'dd/mm/yyyy'
        worksheet.getCell('B1').value = "Kommentare:";
        worksheet.mergeCells('B2:C4');
        worksheet.getCell('C2').value = event.event.comments;
        console.log('table created!');
        worksheet.getCell('D2').value = '="Personen insegsamt:       ' + data.length;
        worksheet.getCell('D3').value = '="Ausgewählt:       "&TEILERGEBNIS(3;Teilnehmer[Vorname])';
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
            res.download(path.join(__dirname, '../../exports/' + filename + 'event.xlsx'));
        });
    } catch (err) {
        logger.error(`Can't load collection: ${req.params.id} cause: ${err}`)
        next(err);
    }
});

module.exports = router;