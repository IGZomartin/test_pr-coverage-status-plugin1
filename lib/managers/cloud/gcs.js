'use strict';

const gcloud = require('gcloud');

const GCSManager = function GCSManager(opts) {

  this.storage = gcloud.storage({
    projectId: opts.credentials.projectId,
    keyFilename: process.cwd() + '/' + opts.credentials.keyFilename
  });

  if (!opts.bucket) {
    throw new Error('Missing required key \'Bucket\' in params');
  }

  this.bucket = this.storage.bucket(opts.bucket);
};

let proto = GCSManager.prototype;

proto.checkBucket = function(cb) {
  this.bucket.getMetadata(function(err) {
    if (err) {
      cb(new Error('Unkwnown \'Bucket\' name'));
    }
    cb();
  });
};

proto.createUpload = function(opts, callback) {

  this.bucket.file(opts.file).getSignedUrl({
    action: 'write',
    contentType: opts.contentType || 'text/plain'
  }, function(err, signedUrl) {
    if (err) {
      return callback(err);
    }

    return callback(null, {url: signedUrl});
  });
};

proto.getDownloadUrl = function(file, callback) {

  this.bucket.file(file).getSignedUrl({
    action: 'read'
  }, function(err, signedUrl) {
    if (err) {
      return callback(err);
    }

    return callback(null, {url: signedUrl});
  });
};

proto.removeFile = function(file, callback) {

  let self = this;

  this.fileExists(file, function(err) {
    if (err) {
      return callback(err);
    }

    self.bucket.file(file).delete(function(err) {
      if (err) {
        return callback(new Error('Error deleting file ' + file + '. ' + err.message));
      }

      return callback();
    });

  });
};

proto.fileExists = function(file, callback) {

  this.bucket.file(file).getMetadata(function(err) {
    if (err) {
      return callback(new Error('File not found: ' + file));
    }

    return callback();
  });
};

module.exports = GCSManager;
