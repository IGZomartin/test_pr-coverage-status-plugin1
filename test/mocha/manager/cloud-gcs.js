'use strict';

const expect = require('expect.js');
const config = require('config');
const validator = require('validator');
const gcloud = require('gcloud');
const assert = require('assert');
const cloud = require('../../../lib/managers/cloud');

const REMOTE_TEST_FILE = 'file/test.txt';
const LOCAL_TEST_FILE = __dirname + '/test.txt';


describe('GCS Manager', function() {

  if (!config.has('gcs')) {
    return;
  }

  describe('Configuration', function() {

    it('ENV configuration exists', function() {

      gcsEnabled();

    });

  });

  describe('Instantiation', function() {

    if (!gcsEnabled()) return;

    it('Create an GCS manager', function() {

      let manager = cloud.create({
        provider: 'gcs',
        credentials: config.get('gcs.credentials'),
        bucket: config.get('gcs.bucket')
      });

      expect(manager).to.be.an('object');

    });

    it('Fails without credentials', function() {

      expect(function() {
        cloud.create({
          provider: 'gcs'
        });

      }).to.throwError();

    });

    it('Fails without a valid bucket', function(done) {
      let manager = cloud.create({
        provider: 'gcs',
        credentials: config.get('gcs.credentials'),
        bucket: 'INVALID-BUCKET-NAME' + Date.now()
      });

      manager.checkBucket(function(err) {
        expect(err).to.be.a(Error);
        done();
      });

    });

  });

  describe('Signed URL', function() {
    if (!gcsEnabled()) return;

    let manager;

    beforeEach(function() {
      manager = cloud.create({
        provider: 'gcs',
        credentials: config.get('gcs.credentials'),
        bucket: config.get('gcs.bucket')
      });

    });

    afterEach(function(done) {
      // delete uploaded objects
      done();
    });

    it('Creates an upload url for an object', function(done) {

      manager.createUpload({
        file: REMOTE_TEST_FILE
      }, function(err, uploadData) {

        let uploadUrl = uploadData.url;

        expect(err).to.be(null);
        expect(validator.isURL(uploadUrl)).to.be(true);
        expect(validator.matches(uploadUrl, encodeURIComponent(REMOTE_TEST_FILE))).to.be(true);
        done();
      });

    });

    it('Returns an URL of an object', function(done) {
      manager.getDownloadUrl(REMOTE_TEST_FILE, function(err, downloadData) {
        let downloadUrl = downloadData.url;

        expect(err).to.be(null);
        expect(validator.isURL(downloadUrl)).to.be(true);
        expect(validator.matches(downloadUrl, encodeURIComponent(REMOTE_TEST_FILE))).to.be(true);
        done();

      });

    });

  });

  describe('CRUD', function() {
    if (!gcsEnabled()) return;

    let manager;

    beforeEach(function(done) {

      manager = cloud.create({
        provider: 'gcs',
        credentials: config.get('gcs.credentials'),
        bucket: config.get('gcs.bucket')
      });

      uploadTestFile(done);

    });

    it('Delete an existing object', function(done) {
      manager.removeFile(REMOTE_TEST_FILE, function(err) {

        expect(err).to.be(undefined);
        done();

      });
    });

    it('Return an error when deleting an unknown file', function(done) {
      manager.removeFile('unknown/random/' + Date.now() + '/' + REMOTE_TEST_FILE, function(err) {

        expect(err).to.be.an(Error);
        done();

      });
    });

  });

});

function uploadTestFile(callback) {

  let storage = gcloud.storage(config.get('gcs.credentials'));
  let bucket = storage.bucket(config.get('gcs.bucket'));

  bucket.upload(LOCAL_TEST_FILE, {
    destination: REMOTE_TEST_FILE
  }, callback);
}

function gcsEnabled() {

  let projectId, keyFilename;

  if (config.get('cloud.provider') !== 'gcs') return false;

  assert(config.has('gcs'), 'Missing gcs config option');

  projectId = config.get('gcs.credentials.projectId');
  keyFilename = config.get('gcs.credentials.keyFilename');

  assert(projectId, 'projectId must be defined');
  assert(!projectId.match(/GCS_PROJECT_ID/), 'projectId must have a valid value');
  assert(keyFilename, 'secretAccessKey must be defined');
  assert(!keyFilename.match(/GCS_KEY_FILENAME/), 'keyFilename must have a valid value');

  return true;
}
