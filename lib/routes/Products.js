'use strict';

const productManager = require('./../managers/Product');
const config = require('config');

// GET
function getProductInfo(req, res, next) {

  let id = req.swagger.params.id.value;

  productManager.get(id, function(err, result) {
    if (err) return next(err);

    delete result.subscriptions;
    res.send(result);
  });
}

// PUT
function updateProductInfo(req, res, next) {

  let id = req.swagger.params.id.value;
  let body = req.swagger.params.appdata.value;

  productManager.update(id, body.appdata, function(err) {
    if (err) return next(err);

    res.status(204).send();
  });
}

// DEL
function deleteProduct(req, res, next) {

  let id = req.swagger.params.id.value;

  productManager.delete(id, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

// POST
function createProduct(req, res, next) {

  let body = req.swagger.params.appdata.value;

  productManager.create(body.appdata, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

// GET
function listAllProducts(req, res, next) {

  let offset = req.swagger.params.offset.value || 0;
  let pageSize = req.swagger.params.pagesize.value || config.get('listing.pagesize');
  let productName = req.swagger.params.name.value || '';
  let productPlatform = req.swagger.params.platform.value || '';
  let user = req.user;

  let options = {
    offset: offset,
    pageSize: pageSize,
    productName: productName,
    productPlatform: productPlatform
  };

  productManager.list(user, options, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

// GET
function shareProduct(req, res, next) {
  // TODO: Implement share
  return next();
}

module.exports = {getProductInfo, updateProductInfo, deleteProduct, createProduct, listAllProducts, shareProduct};
