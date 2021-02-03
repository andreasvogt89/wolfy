const app = require('./app');
require('dotenv').config();
const logger = require('./serverlog/logger');
const http = require('http');
const https = require('https');
const httpsPort = process.env.HTTPS_PORT
const httpPort = process.env.HTTP_PORT

try {
    const httpServer = http.createServer(app);
    httpServer.listen(httpPort, () => {
        logger.info(`Listening: http://localhost:${httpPort}`);
    });
    const httpsServer = https.createServer(app);
    httpsServer.listen(httpsPort, () => {
        logger.info(`Listening: https://localhost:${httpsPort}`);
    });
} catch (e) {
    logger.error(`Can't start webserver: ${e}`);
}

