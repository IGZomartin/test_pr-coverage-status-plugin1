'use strict';

const _ = require('lodash');
const Client = require('../models/Client');
const ProductManager = require('../managers/Product');
const User = require('../models/User');
const Product = require('../models/Product');
const log = require(process.cwd() + '/lib/util/logger');
const errors = require('restify-errors');
const async = require('async');

function findClients(conditions, projection, options, callback) {
  Client.find(conditions, projection, options, callback);
}

function list(options, callback) {
  Client.find({}, {}, {sort: options.sortOrder}, function(error, results) {

    if (error) {
      return callback(error);
    }

    return callback(null, results || []);
  });
}

function create(clientInfo, callback) {
  let client = new Client(clientInfo);
  client.save(callback);
}

function getClientById(cliendId, callback) {

  Client.findById(cliendId, function(error, foundClient) {
    if (error) {
      return callback(error);
    }

    if (!foundClient || _.isEmpty(foundClient)) {
      return callback(new errors.NotFoundError('Could not find requested Client object'));
    }

    return callback(null, foundClient);
  });
}

function getClientByName(clientName, callback) {

  Client.findOne({name: clientName}, function(error, foundClient) {
    if (error) {
      return callback(error);
    }

    let client = foundClient || {};

    return callback(null, client);
  });
}

function preProcessClient(client, changes) {
  let defaultValues = {
    name: '',
    domains: [],
    envs: []
  };

  let merged = _.extend(defaultValues, client, changes);

  log.info('Preprocessing client data');
  log.debug('Preprocessing client data', merged);

  return merged;
}

function update(clientId, newClientInfo, callback) {

  async.waterfall([
    function findClientById(done) {
      getClientById(clientId, function(error, foundClient) {

        if (error) {
          return done(error);
        }

        return done(null, foundClient);
      });
    },
    function ensureClientUniqueness(foundClient, done) {

      if (!newClientInfo.name || (newClientInfo.name && newClientInfo.name === foundClient.name)) {
        newClientInfo.name = foundClient.name;
        return done(null, foundClient, newClientInfo);
      }

      findClients({name: newClientInfo.name}, {}, {}, function(error, results) {
        if (error) {
          return done(error);
        }

        if (!_.isEmpty(results)) {
          return done(new errors.ConflictError('There already exists a client with the provided name'));
        }

        return done(null, foundClient, newClientInfo);
      });
    },
    function updateClientUsers(currentClient, updatedClientInfo, done) {

      User.update({client: currentClient.name}, { $set: { client: updatedClientInfo.name}}, {}, function(error) {
        if (error) {
          return done(error);
        }

        return done(null, currentClient, updatedClientInfo);
      });
    },
    function updateClientProducts(currentClient, updatedClientInfo, done) {

      Product.update({client: currentClient.name}, { $set: { client: updatedClientInfo.name}}, {}, function(error) {
        if (error) {
          return done(error);
        }

        return done(null, currentClient, updatedClientInfo);
      });
    },
    function updateClient(currentClient, updatedClientInfo, done) {

      let editedClient = preProcessClient(currentClient, updatedClientInfo);
      currentClient.set(editedClient);
      currentClient.save(done);
    }
  ], function(error) {
    if (error) {
      return callback(error);
    }

    return callback(null);
  });
}

function retrieveDomains(callback) {

  Client.find({}, function(error, foundClients) {

    if (error) {
      return callback(error);
    }

    let domains = _.uniq(_.map(foundClients, function(client) {
      return client.domains;
    }));

    domains = _.flatten(domains);

    return callback(null, domains);
  });
}

function retrieveNames(callback) {

  Client.find({}, function(error, foundClients) {

    if (error) {
      return callback(error);
    }

    let names = _.map(foundClients, function(client) {
      return client.name;
    });

    return callback(null, names);
  });
}

function retrieveWhitelists(callback) {

  Client.find({}, function(error, foundClients) {

    if (error) {
      return callback(error);
    }

    let whiteListEmails = _.map(foundClients, function(client) {
      return client.whitelist;
    });

    whiteListEmails = _.flatten(whiteListEmails);

    return callback(null, whiteListEmails);
  });
}

function deleteClient(clientId, callback) {

  async.waterfall([
    function findClient(done) {
      getClientById(clientId, function(error, foundClient) {
        if (error) return done(error);
        return done(null, foundClient);
      });
    },
    function findAssociatedProducts(productOwner, done) {
      ProductManager.findProducts({client: productOwner.name}, {}, {}, function(error, productList) {
        if (productList && productList.length && !_.isEmpty(productList)) {
          return done(new errors.BadRequestError('Cannot delete client with associated products'));
        }
        return done();
      });
    },
    function deleteClient(done) {
      Client.remove({_id: clientId}, function(error) {

        if (error) {
          return done(error);
        }

        return done(null);
      });
    }
  ], function(error) {
    if (error) {
      return callback(error);
    }

    return callback(null);
  });
}

module.exports = {list, retrieveDomains, retrieveNames, create, get: getClientByName, update, delete: deleteClient, retrieveWhitelists};
