'use strict';

var errors = require('restify-errors');
var productManager = require('./../managers/Product');
var _ = require('lodash');

function showProductIcon(req, res, next) {
  let productId = req.params.productId;

  productManager.findRaw(productId, function(error, foundProduct) {
    if (error) {
      return next(error);
    }

    if (_.isEmpty(foundProduct.icon)) {
      return next(new errors.NotFoundError('Product has no icon'));
    }

    let img = new Buffer(foundProduct.icon.toString('utf-8'), 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  });
}

module.exports = function(app) {
  app.get('/images/:productId.png', showProductIcon);
};
