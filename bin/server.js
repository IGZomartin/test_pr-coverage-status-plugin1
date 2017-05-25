'use strict';

const config = require('config');

const app = require('../lib/app');

const options = {
  port: process.env.PORT || config.get('port') || app.port
};
app.start(options);

module.exports = app.server;
