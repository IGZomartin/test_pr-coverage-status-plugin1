'use strict';

const async = require('async');
const Product = require('../models/Product');
const cloud = require('./cloud');
const cloudManager = cloud.create(cloud.getProviderConfig());
const _ = require('lodash');
const errors = require('restify-errors');

function findRawProduct(productId, callback) {
  Product.findById(productId, function(error, foundProduct) {

    if (error) {
      return callback(error);
    }

    if (!foundProduct) {
      return callback(new errors.NotFoundError('Product not found'));
    }

    return callback(null, foundProduct);
  });
}

function getProduct(productId, callback) {

  findRawProduct(productId, function(error, product) {
    if (error) {
      return callback(error);
    }

    let result = processProductIconField(product);
    return callback(null, result);
  });
}

function updateProduct(productId, productInfo, callback) {

  Product.findOneAndUpdate({_id: productId}, {$set: productInfo}, {new: true}, callback);
}

function deleteProduct(productId, callback) {

  findRawProduct(productId, function(err, product) {

    if (err) return callback(err);

    if (!product) return callback(new Error('Product not found'));

    async.each(product.compilations, function(compilation, done) {

      cloudManager.removeFile(compilation.filePath, function(err) {

        if (err) return done(err);

        done();
      });
    }, function(err) {

      if (err) return callback(err);

      product.remove(callback);

    });
  });
}

function processProductIconField(productData) {

  if (!productData.icon || _.isEmpty(productData.icon)) {
    return productData.toObject();
  }

  let dupProduct = _.clone(productData.toObject());
  delete dupProduct.icon;
  return dupProduct;
}

function createProduct(productInfo, callback) {

  let product = new Product(productInfo);
  product.save(function(error, result) {
    if (error) {
      return callback(error);
    }
    let prod = processProductIconField(result);
    return callback(null, prod);
  });
}

function buildQuery(user, options) {

  let query = {};

  if (user.igzuser === false) {
    query.client = user.client;
  }

  if (options.productPlatform) {
    query.compilations = { $elemMatch: { platform: options.productPlatform}};
  }

  if (options.productName) {
    query.name = options.productName;
  }

  return query;
}

function buildProjection(options) {

  let projection = {};
  let keys = _.keys(Product.schema.paths);

  _.forEach(keys, function(key) {
    projection[key] = 1;
  });

  if (options.productPlatform) {
    projection.compilations = {$elemMatch: {platform: options.productPlatform}};
  }

  return projection;
}

function listProducts(user, options, callback) {

  let query = buildQuery(user, options);
  let projection = buildProjection(options);

  Product.find(query, projection, {skip: options.offset, limit: options.pageSize}, function(error, productList) {

    if (error) {
      return callback(error);
    }

    let products = [];

    _.forEach(productList, function(product) {
      let processed = processProductIconField(product);

      delete processed.subscriptions;
      products.push(processed);
    });

    return callback(null, products);
  });
}

module.exports = {
  findRaw: findRawProduct,
  get: getProduct,
  update: updateProduct,
  delete: deleteProduct,
  create: createProduct,
  list: listProducts
};
