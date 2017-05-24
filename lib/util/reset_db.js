'use strict';

const mongoose = require('mongoose');
const _ = require('lodash');
const async = require('async');
const config = require('config');
const log = require('../util/logger');

function initDb(callback) {
  log.info('connecting to mongodb...');

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(config.get('db.conn'), {}, function(err) {

      if (err) throw err;

      dropDb(callback);
    });
  } else {
    dropDb(callback);
  }
}

function dropDb(callback) {
  let collections = _.keys(mongoose.connection.collections);
  async.forEach(collections, function(collectionName, done) {
    let collection = mongoose.connection.collections[collectionName];
    collection.remove(function(err) {
      if (err && err.message !== 'ns not found') {
        return done(err);
      }

      done();
    });
  }, callback);
}

module.exports = { initDb, dropDb };
