const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require("jsonwebtoken");
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
    //const userdb = require('./userdb');
    //userdb.createUser().then((res) => {
    //    logger.info(res);
    //}).catch(err => {
    //logger.error(err);
    //});

}).catch(err => {
    logger.error("DB connection failed: " + err)
});


// Delete Persons db
/*
  const {Person} = require('./mongodb');
  Person.deleteMany({}).then(res=>{
    console.log(res);
  }).catch(e=> {
  console.log(e);
});*/
app.post('/login', async(req, res, next) => {
    // Read username and password from request body
    logger.info('login from: ' + req.headers['x-forwarded-for'] +
        " as: " + req.body.username);
    let  timeStamp = new Date()
    timeStamp.setHours(timeStamp.getHours() + 24)
    try {
        const user = await User.find({ username: req.body.username });
        if (user.length !== 0) {
            const match = await bcrypt.compare(req.body.password, user[0].password);
            if (match) {
                // Generate an access token
                let now = new Date();
                let expiresAt = now.setHours( now.getHours() + 3 );
                const accessToken = jwt.sign({
                    username: user[0].username,
                    role: user[0].role
                }, process.env.TOKEN_SECRET, { expiresIn: '3h'});
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



module.exports = app;