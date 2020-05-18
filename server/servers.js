const express = require('express');
const helmet = require('helmet');
const redis = require('redis');
const socketio = require('socket.io');
const bodyParser = require('body-parser');


const {
  redisHost, redisPort, expressPort, environment, redisUrl,
} = require('../config/config');
const { logger } = require('./logging/logger');
const { logMiddleWare } = require('./logging/loggingMiddleware');

const app = express();


app.use(express.static('public/js'));
app.use(express.static('public/css'));
app.use(express.static('public/images'));
app.use(bodyParser.json());
app.use(helmet());
app.use(logMiddleWare);
const expressServer = app.listen(expressPort);
const io = socketio(expressServer);

let client = null;
if (environment === 'DEVELOPMENT') {
  client = redis.createClient(redisPort, redisHost);
} else {
  client = redis.createClient(redisUrl);
}


logger.info(`Express and socketio are listening on port: ${expressPort}`);


client.flushall(function (err, succeeded) {
    logger.info(`Redis status: ${succeeded}`);
});


client.on('connect', () => {
  logger.info(`Redis connected on port: ${redisPort}`);
});

module.exports = {
  app,
  io,
  client,
};
