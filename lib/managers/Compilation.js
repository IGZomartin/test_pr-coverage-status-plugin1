'use strict';

const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const NotificationManager = require('./Notification');
const cloud = require('./cloud');
const plist = require('./plist');
const urlConstructor = require('../util/url_constructor');

const cloudManager = cloud.create(cloud.getProviderConfig());
const errors = require('restify-errors');

function listCompilations(productId, callback) {

  Product.findById(productId, function(err, product) {

    if (err) return callback(err);

    if (!product) return callback(new errors.NotFoundError('Product not found'));

    let compilations = _.sortByOrder(product.compilations, 'uploaded_at', 'desc');

    return callback(null, compilations);
  });
}

function createCompilation(productId, compilationData, callback) {

  async.parallel({
    findProduct: function(done) {
      Product.findById(productId, function(error, foundProduct) {
        if (error) return done(error);

        if (_.isEmpty(foundProduct)) return done(new errors.NotFoundError('Product not found'));

        return done(null, foundProduct);
      });
    },
    ensureUniqueCompilation: function(done) {
      let projection = {};

      let platform = compilationData.platform;
      let platformVersion = compilationData.platformVersion;
      let version = compilationData.version;

      projection.compilations = {$elemMatch: {platform: platform, platformVersion: platformVersion, version: version}};

      Product.find({_id: productId}, projection, {}, function(error, foundMatch) {

        if (error) return done(error);

        if (foundMatch && foundMatch.length && !_.isEmpty(foundMatch[0].compilations)) {
          return done(new errors.ConflictError('A compilation with the provided version and platform already exists'));
        }

        return done();
      });
    }
  }, function(error, result) {

    if (error) return callback(error);

    let product = result.findProduct;

    let compilationPath = urlConstructor.createFilePath(product, compilationData);

    cloudManager.createUpload({file: compilationPath}, function(err, signedUrl) {
      if (err) return callback(err);

      compilationData.compilationId = new mongoose.Types.ObjectId;
      compilationData._id = compilationData.compilationId;

      compilationData.filePath = compilationPath;
      compilationData.downloadUrl = urlConstructor.getDownloadCompilationUrl(product, compilationData);

      product.compilations.push(compilationData);
      product.save(function(err) {
        if (err) return callback(new errors.BadRequestError('Could not create compilation'));

        return callback(null, {compilationId: compilationData.compilationId, url: signedUrl.url});
      });
    });
  });
}

function deleteCompilation(productId, compilationId, callback) {

  Product.findOne({_id: productId, compilations: {$elemMatch: {compilationId: compilationId}}}, function(err, product) {

    if (err) return callback(err);

    if (!product) return callback(new errors.NotFoundError('Compilation not found'));

    let compilationInfo = _.find(product.compilations, function(compilation) {
      return compilation.compilationId.toString() === compilationId;
    });

    let compilationPath = urlConstructor.createFilePath(product, compilationInfo);

    cloudManager.removeFile(compilationPath, function(err) {
      if (err) return callback(err);

      let oldCompilation = _.find(product.compilations, function(compilation) {
        return compilation.compilationId.toString() === compilationId;
      });

      product.compilations.pull(oldCompilation._id);
      product.save(callback);

    });
  });
}

function updateCompilation(productId, compilationId, callback) {

  Product.findOne({_id: productId, compilations: {$elemMatch: {compilationId: compilationId}}}, function(err, product) {

    if (err) return callback(err);

    if (!product) return callback(new errors.NotFoundError('Product not found'));

    let compilationInfo = _.find(product.compilations, function(compilation) {
      return compilation.compilationId.toString() === compilationId;
    });

    let compilationPath = urlConstructor.createFilePath(product, compilationInfo);

    cloudManager.createUpload({file: compilationPath}, function(err, signedUrl) {
      if (err) return callback(err);

      return callback(null, signedUrl);
    });
  });
}

function downloadCompilation(productId, compilationId, callback) {

  Product.findOne({_id: productId, compilations: {$elemMatch: {compilationId: compilationId, uploaded: true}}}, function(err, product) {

    if (err) return callback(err);

    if (!product) return callback(new errors.NotFoundError('Compilation not found'));

    let compilationInfo = _.find(product.compilations, function(compilation) {
      return compilation.compilationId.toString() === compilationId;
    });

    if (compilationInfo.platform === 'ios') {
      return callback(null, {url: urlConstructor.getPlistUrl(product, compilationInfo)});
    }

    let compilationPath = urlConstructor.createFilePath(product, compilationInfo);

    cloudManager.getDownloadUrl(compilationPath, function(err, downloadData) {

      if (err) return callback(err);

      callback(null, downloadData);

    });
  });
}

function uploadAckCompilation(productId, compilationId, callback) {

  Product.findOneAndUpdate({ _id: productId, compilations: { $elemMatch: { compilationId: compilationId } } },
    { $set: { 'compilations.$.uploaded': true } },
    {new: true}, function(err, product) {

      if (err) return callback(err);

      if (!product) return callback(new errors.NotFoundError('Compilation not found'));

      let identities = product.subscriptions.map( (user) => user.toString() );

      let compilation = _(product.compilations).filter( (compilation) => {return _.isEqual(compilation.compilationId.toString(), compilationId);} ).first();

      NotificationManager.sendAckCompilationEmails(identities, compilation.downloadUrl, function(err) {
        if (err) return callback(err);

        return callback(null, product);
      });

    });
}

function downloadPlist(productId, compilationId, callback) {

  Product.findOne({_id: productId, compilations: {$elemMatch: {compilationId: compilationId, uploaded: true}}}, function(err, product) {

    if (err) return callback(err);
    if (!product) return callback(new errors.NotFoundError('Compilation not found'));

    let compilationInfo = _.find(product.compilations, function(compilation) {
      return compilation.compilationId.toString() === compilationId;
    });

    let compilationPath = urlConstructor.createFilePath(product, compilationInfo);

    cloudManager.getDownloadUrl(compilationPath, function(err, downloadData) {
      if (err) return callback(err);

      return callback(null, {
        fileName: compilationInfo.compilationId + '.plist',
        data: plist.buildPlist(product, compilationInfo, downloadData.url)
      });

    });
  });
}

module.exports = {
  list: listCompilations,
  create: createCompilation,
  delete: deleteCompilation,
  update: updateCompilation,
  download: downloadCompilation,
  uploadAck: uploadAckCompilation,
  downloadPlist: downloadPlist
};
