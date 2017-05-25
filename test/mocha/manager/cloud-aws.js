'use strict';

const expect = require('expect.js');
const config = require('config');
const validator = require('validator');
const fs = require('fs');
const AWS = require('aws-sdk');
const assert = require('assert');
const cloud = require('../../../lib/managers/cloud');

const REMOTE_TEST_FILE = 'file/test.txt';
const LOCAL_TEST_FILE = __dirname + '/test.txt';

describe('AWS Manager', function() {

  if (!config.has('aws')) {
    return;
  }

  describe('Configuration', function() {

    it('ENV variables exists', function() {
      awsEnabled();

    });

  });

  describe('Instantiation', function() {
    if (!awsEnabled()) return;

    it('Create an AWS manager', function() {

      let manager = cloud.create({
        provider: 'aws',
        credentials: config.get('aws.credentials'),
        bucket: config.get('aws.bucket')
      });

      expect(manager).to.be.an('object');

    });

    it('Fails without credentials', function() {

      expect(function() {
        cloud.create({
          provider: 'aws'
        });

      }).to.throwError();

    });

    it('Fails without a valid bucket', function(done) {
      let manager = cloud.create({
        provider: 'aws',
        credentials: config.get('aws.credentials'),
        bucket: 'INVALID-BUCKET-NAME' + Date.now()
      });

      manager.checkBucket(function(err) {
        expect(err).to.be.a(Error);
        done();
      });

    });

  });

  describe('Signed URL', function() {
    if (!awsEnabled()) return;

    let manager;

    beforeEach(function() {
      manager = cloud.create({
        provider: 'aws',
        credentials: config.get('aws.credentials'),
        bucket: config.get('aws.bucket')
      });
    });

    afterEach(function(done) {
      // delete uploaded objects
      done();
    });

    it('Creates an upload url for a public object', function(done) {

      manager.createUpload({
        file: REMOTE_TEST_FILE,
        public: true
      }, function(err, uploadData) {

        let uploadUrl = uploadData.url;

        expect(err).to.be(null);
        expect(validator.isURL(uploadUrl)).to.be(true);
        expect(validator.matches(uploadUrl, REMOTE_TEST_FILE)).to.be(true);
        expect(validator.matches(uploadUrl, 'x-amz-acl=public-read')).to.be(true);

        done();
      });

    });

    it('Creates an upload url for a private object', function(done) {
      manager.createUpload({
        file: REMOTE_TEST_FILE,
        public: false
      }, function(err, uploadData) {

        let uploadUrl = uploadData.url;

        expect(err).to.be(null);
        expect(validator.isURL(uploadUrl)).to.be(true);
        expect(validator.matches(uploadUrl, REMOTE_TEST_FILE)).to.be(true);
        expect(validator.matches(uploadUrl, 'x-amz-acl=authenticated-read')).to.be(true);

        done();
      });

    });

    it('Returns an URL of an object', function(done) {
      manager.getDownloadUrl(REMOTE_TEST_FILE, function(err, downloadData) {
        let downloadUrl = downloadData.url;

        expect(err).to.be(null);
        expect(validator.isURL(downloadUrl)).to.be(true);
        expect(validator.matches(downloadUrl, REMOTE_TEST_FILE)).to.be(true);
        done();

      });

    });

  });

  describe('CRUD', function() {
    if (!awsEnabled()) return;

    let manager;

    beforeEach(function(done) {

      manager = cloud.create({
        provider: 'aws',
        credentials: config.get('aws.credentials'),
        bucket: config.get('aws.bucket')
      });

      uploadTestFile(done);

    });

    it('Delete an existing object', function(done) {
      manager.removeFile(REMOTE_TEST_FILE, function(err) {

        expect(err).to.be(undefined);
        done();

      });
    });
  });
});

function uploadTestFile(callback) {
  let body = fs.createReadStream(LOCAL_TEST_FILE);
  let s3obj = new AWS.S3({
    accessKeyId: config.get('aws.credentials.accessKeyId'),
    secretAccessKey: config.get('aws.credentials.secretAccessKey')
  });

  s3obj
    .upload({
      Bucket: config.get('aws.bucket'),
      Key: REMOTE_TEST_FILE,
      Body: body,
      ACL: 'public-read'
    })
    .send(function(err) {
      callback(err);
    });

}

function awsEnabled() {

  let accessKeyId, secretAccessKey;

  if (config.get('cloud.provider') !== 'aws') return false;

  assert(config.has('aws'), 'Missing aws config option');

  accessKeyId = config.get('aws.credentials.accessKeyId');
  secretAccessKey = config.get('aws.credentials.secretAccessKey');

  assert(accessKeyId, 'Access key must be defined');
  assert(!accessKeyId.match(/AWS_ACCESS_KEY_ID/), 'accessKey must have a valid value');
  assert(secretAccessKey, 'secretAccessKey must be defined');
  assert(!secretAccessKey.match(/AWS_SECRET_ACCESS_KEY/), 'secretAccessKey must have a valid value');

  return true;
}
