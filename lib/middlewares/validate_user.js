'use strict';

const errors = require('../util/errors');
const ObjectId = require('mongoose').Types.ObjectId;
const users = require('../managers/User');
const log = require('../util/logger');

module.exports = function() {

  return function(req, res, next) {
    if (req.isPublic) {
      return next();
    }

    let userId = req.headers['x-user-id'];

    if (!userId) {
      log.error('Missing authorization header');
      return next(new errors.UnauthorizedError('Missing authorization header'));
    }

    if (!ObjectId.isValid(userId)) {

      log.error('Invalid Authorization header format');
      return next(new errors.InvalidHeaderError('Invalid Authorization header format'));
    }

    users.get(userId, function(err, user) {

      if (err) {
        return next(err);
      }

      req.user = user;
      req.session.userId = userId;

      return next();
    });
  };
};
