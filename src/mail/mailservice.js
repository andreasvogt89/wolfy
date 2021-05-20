nodemailer = require('nodemailer');
require('dotenv').config();

const smtpConfig = {
    host: process.env.SMTPHOST,
    port: process.env.SMTPPORT,
    secure: true,
    auth: {
        user: process.env.SMTPUSER,
        pass: process.env.SMTPPASSWORD,
    }
};

const mailservice = nodemailer.createTransport(smtpConfig);

module.exports = { mailservice }