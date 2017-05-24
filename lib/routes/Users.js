'use strict';

const userManager = require('./../managers/User');
const config = require('config');
function createSubscription(req, res, next) {

  let id = req.headers['x-user-id'];
  let subscription = req.swagger.params.id.value;

  userManager.subscribe(id, subscription, function(err) {
    if (err) return next(err);

    res.status(204).send();
  });
}

function deleteSubscription(req, res, next) {

  let id = req.headers['x-user-id'];
  let subscription = req.swagger.params.id.value;

  userManager.unsubscribe(id, subscription, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function createUser(req, res, next) {

  let body = req.swagger.params.user.value;

  userManager.create(body, function(err, result) {
    if (err) return next(err);

    let response = {
      id: result._id
    };
    res.send(response);

  });

}

function getUser(req, res, next) {

  let id = req.headers['x-user-id'];

  userManager.get(id, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function listAllUsers(req, res, next) {

  let offset = req.swagger.params.offset.value || 0;
  let pageSize = req.swagger.params.pagesize.value || config.get('listing.pagesize');

  let options = {
    offset: offset,
    pageSize: pageSize
  };

  userManager.list(options, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}
function verifyEmailDomain(req, res, next) {

  let email = req.body.email;

  userManager.verifyEmail(email, function(err, response) {
    if (err) return next(err);

    res.status(200).send(response);
  });
}

module.exports = { createSubscription, deleteSubscription, createUser, getUser, listAllUsers, verifyEmailDomain };
