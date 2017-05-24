'use strict';

const mockery = require('mockery');
const log = require('../../lib/util/logger');

module.exports = function() {

  let mockFakeModule = function() {
    this.removeFile = function(file, callback) {
      log.info('Removed...');
      callback();
    };

    this.createUpload = function(file, callback) {
      let url = {
        url: 'https://s3.amazonaws.com/igz-node-myBucket-test/file/test.txt?AWSAccessKeyId=VALID_EXAMPLE_URL'
      };
      callback(null, url);
    };

    this.getDownloadUrl = function(file, callback) {
      let url = {
        url: 'https://s3.amazonaws.com/igz-node-myBucket-test/file/test.txt?AWSAccessKeyId=VALID_EXAMPLE_URL'
      };
      callback(null, url);
    };
  };

  let moduleUnderTest = '../../lib/managers/cloud';
  mockery.registerAllowable(moduleUnderTest);
  mockery.registerMock('./aws', mockFakeModule);
  mockery.registerMock('./gcs', mockFakeModule);

  mockery.enable({useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false});

  require(moduleUnderTest);
};
