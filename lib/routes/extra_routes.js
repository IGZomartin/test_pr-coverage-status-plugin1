'use strict';

const _ = require('lodash');
const config = require('config');
const productManager = require('./../managers/Product');
const urlConstructor = require('./../util/url_constructor');

const httpHost = urlConstructor.switchToHttp(config.get('host'));

function showProductIcon(req, res, next) { // eslint-disable-line
  let productId = req.params.productId;

  productManager.findRaw(productId, function(error, foundProduct) {

    if (_.isEmpty(foundProduct) || _.isEmpty(foundProduct.icon)) {
      let defaultImageUrl = httpHost + config.get('paths.defaultProductImage');
      res.redirect(301, defaultImageUrl);
      return;
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
