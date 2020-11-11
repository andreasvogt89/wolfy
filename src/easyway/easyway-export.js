const express = require('express');
const router = express.Router();
const logger = require('../serverlog/logger');
const path = require('path');
const exceljs = require('exceljs');
const { authenticateToken } = require('../auth');
const { Event, Person } = require('../mongodb');

router.get('/excel/:id', async (req, res, next) => {
  logger.info(`get excel for event: ${req.params.id}`);
  try{
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "graphics.xlsx"
    );
    const persons = await Person.find({['person.event']: req.params.id});
    const event = await Event.findOne({_id: req.params.id});
    let workbook = new exceljs.Workbook();
    let worksheet = workbook.addWorksheet(event[0].event.name);
    worksheet.addTable({
      name: 'Teilnehmer',
      ref: 'A5',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium6',
        showRowStripes: true,
      },
      columns: [
        {name: 'Vorname', filterButton: true, width: 35},
        {name: 'Nachname', filterButton: true, width: 35},
        {name: 'Handy', filterButton: true, width: 35},
        {name: 'Notfallnummer', filterButton:true, width: 35},
        {name: 'Mail', filterButton: true, width: 35},
        {name: 'Klasse', filterButton: true, width: 35},
        {name: 'Alter', filterButton: true, width: 35},
        {name: 'Kommentar', filterButton: true, width: 35},
        {name: 'Geschlächt', filterButton: true, width: 35},
        {name: 'Strasse', filterButton: true,width: 35},
        {name: 'Ort', filterButton: true, width: 35},
        {name: 'Postleizahl', filterButton: true,width: 35},
      ],
      rows:[],
    });
    const table = worksheet.getTable(event[0].event.name);
    persons.forEach(data => {
      table.addRow([
        data.event.firstname,
        data.event.lastname,
        data.event.phone,
        data.event.emergency_phone,
        data.event.email,
        data.event.class,
        data.event.age,
        data.event.comments,
        data.event.gender,
        data.event.street,
        data.event.street_number,
        data.event.city,
        data.event.postcode,
      ]);
    });
      table.commit();
      const filename = event[0].event.name + "_" + new Date().toDateString();
      await workbook.xlsx.writeFile("../../exports/"+ filename +".xlsx").then(function () {
        logger.info('Excel file saved');
        res.download(path.join(__dirname, '../../../exports/' + filename + '.xlsx'));
    });
  } catch (err){
    logger.error(`Can't load collection: ${req.params.id} cause: ${err}`)
    next(err);
  }
});

module.exports = router;
