'use strict';

const Product = require('../models/Product');
const _ = require('lodash');
const errors = require('restify-errors');
const async = require('async');

function findProducts(conditions, projection, options, callback) {
  Product.find(conditions, projection, options, callback);
}

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

    if (product.compilations && !_.isEmpty(product.compilations)) {
      return callback(new errors.ConflictError('Cannot delete product with existing compilations'));
    }

    product.remove(callback);
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

  async.waterfall([
    function checkProductName(done) {
      verifyProductName(product, done);
    },
    function saveProduct(retProduct, done) {
      retProduct.save(function(error, result) {
        if (error) {
          return done(error);
        }
        let prod = processProductIconField(result);
        return done(null, prod);
      });
    }
  ], function(error, savedProduct) {
    if (error) {
      return callback(error);
    }

    return callback(null, savedProduct);
  });
}

function verifyProductName(product, callback) {

  if (!product.name || !product.client) {
    return callback(new errors.BadRequestError('Missing name and/or client info for new product'));
  }

  Product.find({name: product.name, client: product.client}, function(error, foundProduct) {

    if (error) {
      return callback(error);
    }

    if (foundProduct && foundProduct.length) {
      return callback(new errors.ConflictError('There already exists a Product with the same name for client ' + product.client));
    }

    return callback(null, product);
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

function buildProjection() {

  let projection = {};
  let keys = _.keys(Product.schema.paths);

  _.forEach(keys, function(key) {
    projection[key] = 1;
  });

  return projection;
}

function buildFilter(options) {

  let filter = {};

  if (options.productPlatform) {
    filter = { platform: options.productPlatform};
  }

  return filter;
}

function listProducts(user, options, callback) {

  let query = buildQuery(user, options);
  let projection = buildProjection();
  let filter = buildFilter(options);

  Product.find(query, projection, {skip: options.offset, limit: options.pageSize}, function(error, productList) {

    if (error) {
      return callback(error);
    }

    let products = [];

    _.forEach(productList, function(product) {

      let compilations = _.where(product.compilations, filter);

      product.compilations = compilations;

      let processed = processProductIconField(product);

      processed.subscribed = _.includes(processed.subscriptions, user.id);

      delete processed.subscriptions;
      products.push(processed);
    });

    return callback(null, products);
  });
}

function removeAllCompilations(productId, callback) {

  findRawProduct(productId, function(error, foundProduct) {

    if (error) {
      return callback(error);
    }

    if (_.isEmpty(foundProduct.compilations)) {
      return callback(null);
    }

    foundProduct.compilations = [];
    foundProduct.save(callback);
  });
}

module.exports = {
  findProducts: findProducts,
  findRaw: findRawProduct,
  get: getProduct,
  update: updateProduct,
  delete: deleteProduct,
  create: createProduct,
  list: listProducts,
  removeAllCompilations: removeAllCompilations
};
