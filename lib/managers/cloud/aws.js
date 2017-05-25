'use strict';

const AWS = require('aws-sdk');
const config = require('config');

const AWSManager = function AWSManager(opts) {
  this.s3 = new AWS.S3({
    accessKeyId: opts.accessKeyId,
    secretAccessKey: opts.secretAccessKey,
    region: opts.region || config.get('aws.region')
  });

  if (!opts.bucket) {
    throw new Error('Missing required key \'Bucket\' in params');
  }

  this.bucket = opts.bucket;

};

let proto = AWSManager.prototype;

proto.checkBucket = function(cb) {
  this.s3.headBucket({Bucket: this.bucket}, function(err) {
    if (err) {
      cb(new Error('Unkwnown \'Bucket\' name'));
    }
    cb();
  });
};

proto.createUpload = function(opts, callback) {
  let params = {
    Bucket: this.bucket,
    Key: opts.file,
    ACL: opts.public ? 'public-read' : 'authenticated-read',
    ContentType: 'binary/octet-stream'
  };

  let signedUrl = this.s3.getSignedUrl('putObject', params);

  return callback(null, {url: signedUrl});
};

proto.getDownloadUrl = function(file, callback) {
  let params = {
    Bucket: this.bucket,
    Key: file
  };
  let extension = file.split('.').pop();
  if (extension === 'apk') {
    params.ResponseContentType = 'application/vnd.android.package-archive';
  }

  let signedUrl = this.s3.getSignedUrl('getObject', params);

  return callback(null, {url: signedUrl});

};


proto.removeFile = function(file, callback) {
  let params = {
    Bucket: this.bucket,
    Key: file
  };

  let self = this;

  this.fileExists(file, function(err, fileExists) {
    if (err) {
      return callback(err);
    }

    if (!fileExists) return callback();

    self.s3.deleteObject(params, function(err) {
      if (err) {
        return callback(new Error('Error deleting file ' + file + '. ' + err.message));
      }

      return callback();
    });

  });

};

proto.fileExists = function(file, callback) {
  let params = {
    Bucket: this.bucket,
    Key: file
  };
  this.s3.headObject(params, function(err) {
    if (err) {
      return callback(err.code === 'NotFound' ? (null, false) : err);
    }

    return callback(null, true);
  });
};

module.exports = AWSManager;
