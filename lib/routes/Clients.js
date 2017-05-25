'use strict';

const Client = require('./../managers/Client');

function listClients(req, res, next) {

  Client.list({}, function(error, list) {

    if (error) {
      return next(error);
    }
    res.status(200).send(list);
  });
}

function createClient(req, res, next) {

  let clientInfo = req.swagger.params.client.value;

  Client.create(clientInfo, function(error, output) {

    if (error) {
      return next(error);
    }

    res.status(200).send(output);
  });
}

function getClient(req, res, next) {

  let clientName = req.swagger.params.id.value;

  Client.get(clientName, function(error, output) {

    if (error) {
      return next(error);
    }

    res.status(200).send(output);
  });
}

function updateClient(req, res, next) {

  let clientId = req.swagger.params.id.value;
  let clientInfo = req.swagger.params.client.value;

  Client.update(clientId, clientInfo, function(error) {

    if (error) {
      return next(error);
    }

    res.status(204).send();
  });
}

function deleteClient(req, res, next) {

  let clientId = req.swagger.params.id.value;

  Client.delete(clientId, function(error) {

    if (error) {
      return next(error);
    }

    res.status(204).send();
  });
}

module.exports = { listClients, createClient, getClient, updateClient, deleteClient };
