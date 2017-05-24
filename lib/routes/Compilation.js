'use strict';

const compilationManager = require('./../managers/Compilation');
const log = require('../util/logger');
const config = require('config');

function getCompilations(req, res, next) {

  let id = req.swagger.params.id.value;

  compilationManager.list(id, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function createCompilation(req, res, next) {

  let productId = req.swagger.params.id.value;
  let compilationData = req.swagger.params.compilation.value;

  compilationManager.create(productId, compilationData.compilation, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function deleteCompilation(req, res, next) {

  let productId = req.swagger.params.id.value;
  let compilationId = req.swagger.params.compilationId.value;

  compilationManager.delete(productId, compilationId, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function updateCompilation(req, res, next) {

  let productId = req.swagger.params.id.value;
  let compilationId = req.swagger.params.compilationId.value;

  compilationManager.update(productId, compilationId, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function uploadAckCompilation(req, res, next) {

  let productId = req.swagger.params.id.value;
  let compilationId = req.swagger.params.compilationId.value;

  compilationManager.uploadAck(productId, compilationId, function(err, result) {
    if (err) return next(err);

    res.send(result);
  });
}

function downloadCompilation(req, res, next) {

  let publicToken = req.swagger.params.publicToken.value;

  if (!req.session.userId && !req.headers['x-user-id'] && !publicToken) {
    let loginUrl = config.get('host') + config.get('redirectPaths.login');
    let downloadUrl = encodeURIComponent(config.get('host') + req.url);
    let redirectUrl = loginUrl + '?redirect_uri=' + downloadUrl;

    res.redirect(301, redirectUrl);
    return;
  }
  let productId = req.swagger.params.id.value;
  let compilationId = req.swagger.params.compilationId.value;

  compilationManager.download(productId, compilationId, publicToken, function(err, result) {
    if (err) return next(err);

    let url = result.url;

    if ( result.url.match(/\/plist$/) && req.device.is('iOS')) {
      url = config.get('plist.downloadActionParameters') + result.url;
    }

    log.info('> Download::redirecting to file: ', url);
    res.redirect(301, url);
  });
}

function downloadCompilationPlist(req, res, next) {

  let productId = req.swagger.params.id.value;
  let compilationId = req.swagger.params.compilationId.value;

  // NOTE: WARNING! plist file SHOULD NOT be protected with headers of cookies,
  // because iOS downloads it with its own protocol "itms-service" which does not
  // sends any header or cookie in the request.

  compilationManager.downloadPlist(productId, compilationId, function(err, result) {
    if (err) return next(err);

    res.setHeader('Content-Type', 'application/xml' );
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"` );

    res.send(result.data);
  });
}

module.exports = {
  getCompilations, createCompilation, deleteCompilation, updateCompilation,
  downloadCompilation, downloadCompilationPlist, uploadAckCompilation
};
