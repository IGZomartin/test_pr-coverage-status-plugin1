'use strict';

const _ = require('lodash');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const swaggerTools = require('swagger-tools');
const config = require('config');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const onFinished = require('on-finished');

const log = require(process.cwd() + '/lib/util/logger');
const errors = require('./util/errors');

const addExtraRoutes = require('./routes/extra_routes');
const checkUser = require('./middlewares/validate_user');
const checkUrl = require('./middlewares/check_url');
const checkAdmin = require('./middlewares/check_admin');
const verifyClient = require('./middlewares/verify_client');
const mobileDetect = require('./middlewares/mobile-detect');

const mongodb = require('../lib/util/mongodb');
const app = express({name: 'ig155-app'});
const httpPayloadLimit = config.get('httpPayloadLimit');
app.use(cors());
addExtraRoutes(app);

// swaggerRouter configuration
let options = {
  swaggerUi: '/swagger.json',
  controllers: './lib/routes', // Path relative to project root
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
let swaggerDoc = require('./api/swagger.json');
let port = _.last(swaggerDoc.host.split(':'));

app.use(session({
  secret: 'igz155',
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: config.get('cookies.maxAge')
  },
  store: new MongoStore({
    url: config.get('db.conn'),
    ttl: config.get('cookies.maxAge')
  })
}));

app.use(function(req, res, next) {
  log.info('> ' + req.method + ' ' + req.url);
  next();
});

app.use(function(req, res, next) {

  onFinished(res, function(err) {
    let timing = Date.now() - new Date(req._time);

    if (err) {
      log.error('< ', err);
    }

    log.info('< headers', res.headers);

    if (res._data) {
      log.info('< ', res.statusCode, res._data.length, 'bytes', timing, 'ms');
    } else {
      log.info('< ', res.statusCode, 'empty response', timing, 'ms');
    }

  });

  next();
});

app.on('uncaughtException', function(req, res, router, error) {
  log.error('UncaughtException', error);
});

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function(middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  /* Middlewares go here */
  app.use(checkUrl());
  app.use(checkUser());
  app.use(checkAdmin());
  app.use(verifyClient());
  app.use(mobileDetect());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  app.use(logErrors);
  app.use(errorHandler);

});

app.use(bodyParser.json({limit: httpPayloadLimit}));
app.use(bodyParser.urlencoded({limit: httpPayloadLimit, extended: true}));

app.on('uncaughtException', function(req, res, router, error) {
  log.error('UncaughtException', error);
});

function logErrors(err, req, res, next) {
  log.error(err.stack);
  next(err);
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof errors.HttpError) {
    res.status(err.statusCode).json(err.body);
    return;
  }

  if (err.message && err.statusCode) {
    let error = new errors.RestError({message: err.message, statusCode: err.statusCode});
    res.status(error.statusCode).json(error.body);
    return;
  }
  res.status(500).json({code: 'InternalError', message: err.message || 'Fatal error'});
}

function start(options) {

  log.info('Connecting to MongoDB...');
  mongodb.connect(function() {

    app.listen(options.port, function() {
      log.info('Service listening on port', options.port);
      log.info('Your server is listening on port %d (http://localhost:%d)', options.port, options.port);
      log.info('Swagger-ui is available on http://localhost:%d/docs', options.port);
    });
  });

}

module.exports = {
  start: start,
  server: app,
  port: port
};
