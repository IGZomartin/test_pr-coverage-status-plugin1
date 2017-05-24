'use strict';

const config = require('config');
const slug = require('slug');

function getProductImageRelativeUrl(product) {

  if (!product.icon) {
    return '';
  }

  return '/images/' + product._id + '.png';
}

function createFilePath(product, compilationData) {
  let extension = compilationData.platform === 'ios' ? '.ipa' : '.apk';
  let client = slug(product.client);
  let productName = slug(product.name);
  let platform = slug(compilationData.platform);
  let environment = slug(compilationData.environment);
  let version = slug(compilationData.version || '');

  return client + '/' + productName + '/' + platform + '/' + environment + '/' + productName + '-' + environment + '-' + version + extension;
}

function buildCompilationUrl(product, compilation) {
  return config.get('host') + '/api/v1/product/' + product.id + '/compilation/' + compilation.compilationId;
}

function getPlistUrl(product, compilationData) {
  return buildCompilationUrl(product, compilationData) + '/plist';
}

function getDownloadCompilationUrl(product, compilation) {
  return buildCompilationUrl(product, compilation) + '/download';
}

module.exports = { getPlistUrl, createFilePath, getDownloadCompilationUrl, getProductImageRelativeUrl };
