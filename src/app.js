const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cron = require('node-cron');
const moment = require('moment');
const { mailservice } = require('./mail/mailservice');
const logger = require('./serverlog/logger');
const { connectDb } = require('./mongodb');
const bcrypt = require('bcrypt');
const easywayexport = require('./easyway/easyway-export');

require('dotenv').config();


const middlewares = require('./middlewares');
const easyWay = require('./easyway/easyway');
const { User } = require('./mongodb');
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({
        message: 'Server is running 💩'
    });
});

require('dotenv').config();

connectDb().then(() => {
    logger.info("DB connection successful!");

    // Create new User manually
    /* const userdb = require('./userdb');
    userdb.createUser().then((res) => {
        logger.info(res);
    }).catch(err => {
        logger.error(err);
    }); */

}).catch(err => {
    logger.error("DB connection failed: " + err)
});

app.post('/login', async(req, res, next) => {
    // Read username and password from request body
    logger.info('login from: ' + req.headers['x-forwarded-for'] +
        " as: " + req.body.username);
    let timeStamp = new Date()
    timeStamp.setHours(timeStamp.getHours() + 24)
    try {
        const user = await User.find({ username: req.body.username });
        if (user.length !== 0) {
            const match = await bcrypt.compare(req.body.password, user[0].password);
            if (match) {
                // Generate an access token
                let now = new Date();
                let expiresAt = now.setHours(now.getHours() + 3);
                const accessToken = jwt.sign({
                    username: user[0].username,
                    role: user[0].role
                }, process.env.TOKEN_SECRET, { expiresIn: '3h' });
                user[0].password = "😋"
                res.status(200).json({
                    accessToken,
                    user,
                    expiresAt,
                });
            } else {
                res.status(401).send({ message: "Wrong password or username" });
            }
        } else {
            res.status(401).send({ message: "Wrong password or username" });
        }
    } catch (err) {
        logger.error('Auth failed:' + err.message);
        next(err);
    }
});

app.use('/easyway', easyWay);
app.use('/export', easywayexport)
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

//mail job
/*
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
  // every 1th of month = '* * * 1,2,3,4,5,6,7,8,9,10,11,12 1'
*/
cron.schedule('* * * 1,2,3,4,5,6,7,8,9,10,11,12 1', async() => {
    logger.info('start mail report job...');
    moment.locale('de-ch');
    let filename = "Statistik " + new moment(new Date()).format('LL');
    console.log(`${filename}`);
    try {
        await easywayexport.createStatisticExcel("*", new Date().getFullYear().toString(), filename, (result) => {
            if (result) {
                const mailOptions = {
                    from: `"🦝" <${process.env.SMTPUSER}>`,
                    to: process.env.MAILRECIPIENT,
                    subject: 'Backup Report',
                    text: 'Chasch i ahhang go luege..  🐴',
                    html: '<b>Chasch i ahhang go luege..  🐴</b>',
                    attachments: [{
                        filename: filename + '.xlsx',
                        path: path.join(__dirname, '../exports/' + filename + '.xlsx'),
                    }],
                };
                mailservice.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        throw `failed to send mail to: ${mailOptions.to} cos: ${error}`;
                    }
                    logger.info(`sent reporter mail to: ${mailOptions.to}`)
                });
            } else {
                throw result;
            }
        });
    } catch (err) {
        logger.error(error);
    }
}, {
    scheduled: true,
    timezone: "Europe/Zurich"
});

module.exports = app;