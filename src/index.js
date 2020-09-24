const app = require('./app');
require('dotenv').config();
const logger = require('./serverlog/logger');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const httpPort = process.env.httpPort || 5544
const httpsPort = process.env.httpsPort || 4556

logger.info(fs.realpathSync('.'));
try {
// Certificate
  const privateKey = fs.readFileSync(path.join(__dirname,'../cert/privkey.pem'));
  const certificate = fs.readFileSync(path.join(__dirname,'../cert/cert.pem'));
  const ca = fs.readFileSync(path.join(__dirname,'../cert/chain.pem'));
  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
  const httpsServer = https.createServer(credentials,app);
  httpsServer.listen(httpsPort, () => {
    /* eslint-disable no-console */
    logger.info(`Listening: http://localhost:${httpsPort}`);
    /* eslint-enable no-console */
  });
} catch (e) {
  logger.error('can not load certificate and start https: ' + e.message);
}

const httpServer = http.createServer(app);

httpServer.listen(httpPort, () => {
  /* eslint-disable no-console */
  logger.info(`Listening: http://localhost:${httpPort}`);
  /* eslint-enable no-console */
});

