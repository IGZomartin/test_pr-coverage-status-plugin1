'use strict';

const _ = require('lodash');
const Client = require('../models/Client');
const log = require(process.cwd() + '/lib/util/logger');
const errors = require('restify-errors');

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

function update(cliendId, newClientInfo, callback) {

  getClientById(cliendId, function(error, foundClient) {

    if (error) {
      return callback(error);
    }

    let editedClient = preProcessClient(foundClient, newClientInfo);
    foundClient.set(editedClient);
    foundClient.save(function(error) {

      if (error) {
        return callback(error);
      }

      return callback(null);
    });
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

  getClientById(clientId, function(error) {

    if (error) {
      return callback(error);
    }

    Client.remove({_id: clientId}, function(error) {

      if (error) {
        return callback(error);
      }

      return callback(null);
    });
  });
}

module.exports = {list, retrieveDomains, retrieveNames, create, get: getClientByName, update, delete: deleteClient, retrieveWhitelists};
