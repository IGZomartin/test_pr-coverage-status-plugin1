'use strict';

const async = require('async');
const config = require('config');
const errors = require('restify-errors');
const _ = require('lodash');

const User = require('../models/User');
const Product = require('../models/Product');
const ClientManager = require('./Client');
const NotificationManager = require('./Notification');
const domainChecker = require(process.cwd() + '/lib/util/check_domain');
const log = require(process.cwd() + '/lib/util/logger');

function subscribe(userId, productId, callback) {
  Product.findOneAndUpdate({_id: productId}, {$push: {subscriptions: userId}}, {new: true}, callback);
}

function unsubscribe(userId, productId, callback) {
  Product.findOneAndUpdate({_id: productId}, {$pull: {subscriptions: userId}}, {new: true}, callback);
}

function preProcessUser(user, changes) {
  let defaultUser = {
    name: '',
    email: '',
    client: '',
    igzuser: false,
    subscriptions: []
  };

  let merged = _.extend(defaultUser, user, changes);

  log.info('Preprocessing client data');
  log.debug('Preprocessing client data', merged);

  return merged;
}

function create(userInfo, callback) {
  let newUser = preProcessUser(null, userInfo);

  async.waterfall([
    function checkEmail(done) {
      verifyEmail(newUser.email, function(error, output) {

        if (error) {
          return done(error);
        }

        if (!output.canRegister) {
          return done(new errors.ConflictError('Cannot register user for provided domain'));
        }

        return done(null, output.canRegister);
      });
    },
    function checkClient(output, done) {

      ClientManager.list({sortOrder: {ts: 'desc'}}, function(error, foundClients) {

        if (error) {
          return done(error);
        }
        let userIsSuperadmin = domainChecker.isSuperadmin(newUser.email);

        if (userIsSuperadmin) {
          newUser.client = 'IGZ';
          return done(null, newUser);
        }

        let whitelistClient = _(foundClients).where({'whitelist': [newUser.email]}).value();

        if (whitelistClient && whitelistClient.length) {
          newUser.client = whitelistClient[0].name;
          return done(null, newUser);
        }

        let userDomain = domainChecker.getDomain(newUser.email);
        let userClient = _(foundClients).where({'domains': [userDomain]}).value();

        if (userClient) {
          newUser.client = userClient[0].name;
        }

        return done(null, newUser);
      });
    }], function(error, validUser) {

    if (error) {
      return callback(error);
    }

    let user = new User(validUser);
    user.save(function(error, user) {
      if (error) callback(error);

      NotificationManager.sendIdentityToResonator(user, function(error) {
        if (error) {
          user.remove();
          return callback(error);
        }

        callback(null, user);
      });

    });

  });
}

function getUser(userId, callback) {

  User.findById(userId, function(error, foundUser) {

    if (error) {
      return callback(error);
    }

    if (!foundUser || _.isEmpty(foundUser)) {
      return callback(new errors.NotFoundError('Could not find requested user'));
    }

    return callback(null, foundUser);
  });
}

function findByEmail(email, callback) {
  let regEx = new RegExp(config.get('validations.email'), 'i');

  if (!regEx.test(email)) {
    return callback(new errors.UnprocessableEntityError('Email not valid'));
  }
  User.findOne({email: email}, callback);
}

function verifyEmail(emailToVerify, callback) {

  async.waterfall([
    function checkUserExistence(done) {
      findByEmail(emailToVerify, function(error, user) {
        if (error) return done(error);

        if (user) {
          return done(new errors.ConflictError('Email already in use'));
        }

        return done();
      });
    },
    function retrieveDomains(done) {

      ClientManager.retrieveDomains(function(error, domains) {
        if (error) {
          return done(error);
        }
        return done(null, domains);
      });
    },
    function retrieveWhitelists(domains, done) {

      ClientManager.retrieveWhitelists(function(error, whitelists) {
        if (error) {
          return done(error);
        }

        return done(null, domains, whitelists);
      });
    },
    function verifyDomain(domains, whitelists, done) {

      let response = domainChecker.isValidDomain(emailToVerify, domains) || _.contains(whitelists, emailToVerify);
      return done(null, {canRegister: response});
    }
  ], function(error, response) {
    if (error) {
      return callback(error);
    }
    return callback(null, response);
  });
}

function listUsers(options, callback) {

  User.find({}, {}, {skip: options.offset, limit: options.pageSize, sort: options.sortOrder}, function(error, userList) {

    if (error) {
      return callback(error);
    }

    let users = userList || [];

    return callback(null, users);
  });
}
module.exports = { subscribe, unsubscribe, create, get: getUser, verifyEmail, list: listUsers};
