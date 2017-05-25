'use strict';

const errors = require('../util/errors');
const products = require('../managers/Product');
const config = require('config');

module.exports = function() {

  return function(req, res, next) {

    if (!req.path.match(new RegExp(config.get('auth.productPathMiddleware'), 'i'))) {
      return next();
    }

    let productId = req.path.match(new RegExp('(?:[0-9]+[a-z]|[a-z]+[0-9])[a-z0-9]+', 'g'))[0];

    if (req.isAdmin || req.isPublic) {
      return next();
    }

    products.get(productId, function(error, foundProduct) {

      if (error) {
        return next(error);
      }

      let hasAccess = (foundProduct.client === req.user.client);

      if (!hasAccess) {
        return next(new errors.ForbiddenError('Not allowed'));
      }

      return next();
    });
  };
};
