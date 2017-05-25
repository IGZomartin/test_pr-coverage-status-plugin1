'use strict';

const _ = require('lodash');
const config = require('config');
const errors = require('restify-errors');

module.exports = function() {

  return function checkAdmin(req, res, next) {

    if (req.isPublic) {
      return next();
    }

    req.isAdmin = req.user.igzuser;

    let adminUrl = _.some(config.get('auth.adminPathMatch'), function(pattern) {
      return req.path.match(new RegExp(pattern, 'g')) && (req.method === 'POST' || req.method === 'PUT');
    });

    if (!adminUrl) {
      return next();
    }

    if (!req.isAdmin && adminUrl) {
      return next(new errors.UnauthorizedError('Only admin users allowed'));
    }

    return next();
  };

};
