#!/usr/bin/env node
var config = require('config');
var async = require('async');
var mongoose = require('mongoose');
var _ = require('lodash');
var argv = require('yargs')
  .count('verbose')
  .alias('e', 'email')
  .demand('email')
  .argv;

var CIPHERLAYER_DB_PATH = 'mongodb://localhost:27017/cipherlayer?w=1';
var BACKEND_DB_PATH = config.get('db.conn');
var CIPHERLAYER_USERS_COLLECTION_NAME = 'users';
var BACKEND_USERS_COLLECTION_NAME = 'users';
var RESONATOR_DB_PATH = 'mongodb://localhost:27017/resonator-backend';
var RESONATOR_IDENTITIES_COLLECTION_NAME = 'identities';

var email = argv.email;

async.series({
  connectCipherlayerDB: function(done) {
    connect(CIPHERLAYER_DB_PATH, done);
  },
  deleteCipherlayerUserByEmail: function(done) {
    deleteUserFromDb(CIPHERLAYER_USERS_COLLECTION_NAME, 'username', email, done);
  },
  disconnectCipherlayerDb: function(done) {
    mongoose.disconnect(done);
  },
  connectBackendDB: function(done) {
    connect(BACKEND_DB_PATH, done);
  },
  deleteBackendUserByEmail: function(done) {
    deleteUserFromDb(BACKEND_USERS_COLLECTION_NAME, 'email', email, done);
  },
  disconnectBackendDb: function(done) {
    mongoose.disconnect(done);
  },
  connectResonatorDb: function(done) {
    connect(RESONATOR_DB_PATH, done);
  },
  deleteResonatorIdentityByEmail: function(done) {
    deleteIdentityFromResonator(email, done);
  },
  disconnectResonatorDb: function(done) {
    mongoose.disconnect(done);
  }
}, function(error, output) {
  if (error) {
    console.log('Fatal error: ' + error);
    process.exit(1)
  }
  console.log('Done!');
  process.exit(0)
});

function connect(databasePath, done) {
    mongoose.connect(databasePath, function(err) {

      if (err) {
        return done(err);
      }
      console.log('Connected to MongoDB path ' + databasePath);

      mongoose.connection.on('error', function(err) {
        console.log(err);
      });

      mongoose.connection.on('open', function() {
        console.log('Connected');
      });
      return done();
    });
}

function deleteUserFromDb(collectionName, fieldName, fieldValue, done) {
  var collection = mongoose.connection.db.collection(collectionName);

  var queryParams = {};
  queryParams[fieldName] = fieldValue;
  collection.remove(queryParams, function(err) {
    if (err && err.message !== 'ns not found') {
      return done(err);
    }

    return done();
  });
}

function deleteIdentityFromResonator(email, done) {

  var collection = mongoose.connection.db.collection(RESONATOR_IDENTITIES_COLLECTION_NAME);

  collection.remove({'devices.email': { $in: [email]}}, function(err) {
    if (err) return done(err);

    return done();
  });
}
