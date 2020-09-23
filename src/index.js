const app = require('./app');
require('dotenv').config();
const logger = require('./serverlog/logger');
const http = require('http');
const https = require('https');
const fs = require('fs');

// Certificate
const privateKey = fs.readFileSync('Z:\\dinifarb.duckdns.org\\privkey.pem', 'utf8');
const certificate = fs.readFileSync('Z:\\dinifarb.duckdns.org\\cert.pem', 'utf8');
const ca = fs.readFileSync('Z:\\dinifarb.duckdns.org\\chain.pem', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

const httpPort = process.env.httpPort || 5000
const httpsPort = process.env.httpsPort || 4556

httpServer.listen(httpPort, () => {
  /* eslint-disable no-console */
  logger.info(`Listening: http://localhost:${httpPort}`);
  /* eslint-enable no-console */
});
httpsServer.listen(httpsPort, () => {
  /* eslint-disable no-console */
  logger.info(`Listening: http://localhost:${httpsPort}`);
  /* eslint-enable no-console */
});
