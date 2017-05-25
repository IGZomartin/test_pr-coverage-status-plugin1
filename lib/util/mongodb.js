'use strict';

const mongoose = require('mongoose');
const config = require('config');
const log = require('./logger');

let env = process.env.NODE_ENV || 'development';

mongoose.set('debug', env === 'development');

module.exports = {
  connect: function(done) {

    mongoose.connect(config.get('db.conn'), function(err) {
      if (err) throw err;
      log.info('Connected to MongoDB');

      mongoose.connection.on('error', function(err) {
        log.error(err);
      });

      if (done) {
        done();
      }

    });

  }
};
