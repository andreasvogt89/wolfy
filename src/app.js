const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const logger = require('./serverlog/logger');


require('dotenv').config();

const middlewares = require('./middlewares');
const easyWay = require('./easyway/easyway');
const {loadCollection} = require('./mongodb');
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

app.post('/login', async (req, res, next) => {
  // Read username and password from request body
  logger.info('login from: ' + res.location.toString())
  try {
    const { username, password } = req.body;
    const collection = await loadCollection("users","UserDB");
    const users = await collection.find({}).toArray();
    const user = users.find(u => { return u.username === username && u.password === password });
    if (user) {
      // Generate an access token
      const accessToken = jwt.sign({
        username: user.username,
        role: user.role
      }, process.env.TOKEN_SECRET, { expiresIn: '10s' });
      res.json({
        accessToken
      });
    } else {
      res.status(401).send(new Error("Wrong password or username"));
    }
  } catch (err) {
    logger.error('Auth failed:' + err.message);
    next(err);
  }
});


app.use('/easyway', easyWay);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);



module.exports = app;
