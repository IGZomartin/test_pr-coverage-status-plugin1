'use strict';

const config = require('config');
const resonatorConfig = config.externalServices.resonator;
const mockery = require('mockery');
const expect = require('expect.js');
const _ = require('lodash');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const nock = require('nock');
const fs = require('fs');
const resetDB = require('../../../lib/util/reset_db');
const app = require('../../../bin/server');
const urlConstructor = require('../../../lib/util/url_constructor');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';

let mockeryAws;

describe('Compilation Router', function() {

  this.timeout(30000);

  before(function(done) {
    mockeryAws = require('../mockery');
    mockeryAws();
    return done();
  });

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  after(function(done) {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  it('Create Compilation: Valid JSON', function(done) {
    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/validCompilation');
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .post('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send({compilation: compilationInfo})
        .expect(200)
        .end(function(err, res) {

          let compilation = res.body;

          expect(err).to.be(null);
          expect(compilation).to.have.property('url');
          expect(compilation).to.have.property('compilationId');
          done();
        });
    });
  });

  it('Create compilation: Check compilation fields', function(done) {

    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/validCompilation');
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, output) {
      expect(err).to.be(null);
      let product = output[0][0];

      request(app)
        .post('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send({compilation: compilationInfo})
        .expect(200)
        .end(function(err, res) {

          let compilation = res.body;

          expect(err).to.be(null);
          expect(compilation).to.have.property('url');
          expect(compilation).to.have.property('compilationId');

          request(app)
            .get('/api/v1/product/' + product._id + '/compilation')
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(200)
            .end(function(error, response) {

              let createdCompilation = _.last(response.body);

              expect(createdCompilation).to.have.property('compilationId');
              expect(createdCompilation.compilationId).not.to.be.empty();
              expect(createdCompilation.compilationId).to.equal(createdCompilation._id);

              expect(createdCompilation).to.have.property('version');
              expect(createdCompilation.version).to.equal(compilationInfo.version);

              expect(createdCompilation).to.have.property('platform');
              expect(createdCompilation.platform).to.equal(compilationInfo.platform);

              expect(createdCompilation).to.have.property('platformVersion');
              expect(createdCompilation.platformVersion).to.equal(compilationInfo.platformVersion);

              expect(createdCompilation).to.have.property('public');
              expect(createdCompilation.public).to.equal(compilationInfo.public);

              expect(createdCompilation).to.have.property('environment');
              expect(createdCompilation.environment).to.equal(compilationInfo.environment);

              expect(createdCompilation).to.have.property('permission');
              expect(createdCompilation.permission).to.equal(compilationInfo.permission);

              expect(createdCompilation).to.have.property('uploaded_at');
              expect(createdCompilation.uploaded_at).to.not.be(undefined);

              expect(createdCompilation).to.have.property('uploaded');
              expect(createdCompilation.uploaded).to.equal(compilationInfo.uploaded);

              expect(createdCompilation).to.have.property('filePath');
              expect(createdCompilation.filePath).to.not.be(undefined);

              expect(createdCompilation).to.have.property('filename');
              expect(createdCompilation.filename).to.equal(compilationInfo.filename);

              expect(createdCompilation).to.have.property('downloadUrl');
              expect(createdCompilation.downloadUrl).to.equal(urlConstructor.getDownloadCompilationUrl(product, createdCompilation));

              done();
            });
        });
    });
  });

  it('Create Compilation: Invalid data', function(done) {
    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/invalidCompilation');
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .post('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send({compilation: compilationInfo})
        .expect(400)
        .end(function(err, res) {

          expect(err).to.be(null);

          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.eql('Could not create compilation');

          done();
        });
    });
  });

  it('Delete Compilation: Valid JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, res) {

          let compilations = res.body.compilations;

          expect(err).to.be(null);
          expect(_.find(compilations, {compilationId: compilationInfo.compilationId})).to.be.eql(undefined);

          done();
        });
    });
  });

  it('Get Compilation: Valid JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, res) {

          let compilations = res.body;

          expect(err).to.be(null);
          expect(_.find(compilations, {version: compilationInfo.version})).not.to.be.eql(undefined);

          done();
        });
    });
  });

  it('Download Compilation: Not Uploaded Compilation', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/user')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(error, response) {
          expect(error).to.be(null);
          request(app)
            .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
            .set('Cookie', response.headers['set-cookie'])
            .expect(404)
            .end(function(err, res) {
              expect(err).to.be(null);
              expect(res.body).to.have.property('message');
              expect(res.body.message).to.be.eql('Compilation not found');
              return done();
            });
        });
    });
  });

  it('Download Compilation: only valid session cookie', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/user')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(error, response) {
          expect(error).to.be(null);

          request(app)
            .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('Cookie', response.headers['set-cookie'])
            .expect(301)
            .end(function(err, res) {
              expect(err).to.be(null);
              expect(res.body).to.be.empty();
              done();
            });
        });
    });
  });

  it('Download Compilation: session cookie timeout and no x-user-id', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];
      request(app)
        .get('/api/v1/user')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(error, response) {
          expect(error).to.be(null);

          setTimeout(function() {
            request(app)
              .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
              .set('Content-Type', 'application/json; charset=utf-8')
              .set('Cookie', response.headers['set-cookie'])
              .expect(401)
              .end(function(err, res) {
                expect(err).to.be(null);
                expect(res).not.to.be(null);
                expect(res.body).to.have.property('code');
                expect(res.body.code).to.equal('UnauthorizedError');
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.equal('You need to be logged in to download this compilation');
                done();
              });
          }, config.get('cookies.maxAge') * 2);
        });
    });
  });

  it('Download Compilation: missing session cookie AND missing x-user-id', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
        .set('Content-Type', 'application/json; charset=utf-8')
        .expect(401)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).not.to.be(null);
          expect(res.body).to.have.property('code');
          expect(res.body.code).to.equal('UnauthorizedError');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('You need to be logged in to download this compilation');
          done();
        });
    });
  });

  it('Download Compilation: only non-admin x-user-id', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(301)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.be.empty();
          done();
        });
    });
  });

  it('Download Compilation: only admin x-user-id', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(301)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.be.empty();
          done();
        });
    });
  });

  it('Download Compilation: missing session cookie AND missing x-user-id', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/download')
        .set('Content-Type', 'application/json; charset=utf-8')
        .expect(401)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).not.to.be(null);
          expect(res.body).to.have.property('code');
          expect(res.body.code).to.equal('UnauthorizedError');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('You need to be logged in to download this compilation');
          done();
        });
    });
  });

  it('Download Plist: only non-admin x-user-id', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/plist')
        .expect(200)
        .end(function(err, res) {

          expect(err).to.be(null);
          expect(res.header['content-disposition']).to.match(/attachment; filename="01f0000000000000003f0001.plist"/);

          let downloadedPlist = res.text;
          let examplePlist = fs.readFileSync(__dirname + '/../manager/example.plist').toString();
          expect(downloadedPlist).to.be.eql(examplePlist);

          done();
        });
    });
  });

  it('Download Plist: only admin x-user-id', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/plist')
        .expect(200)
        .end(function(err, res) {

          expect(err).to.be(null);
          expect(res.header['content-disposition']).to.match(/attachment; filename="01f0000000000000003f0001.plist"/);

          let downloadedPlist = res.text;
          let examplePlist = fs.readFileSync(__dirname + '/../manager/example.plist').toString();
          expect(downloadedPlist).to.be.eql(examplePlist);

          done();
        });
    });
  });

  it('Download Plist: Not Uploaded Compilation', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = false;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/user')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(error) {
          expect(error).to.be(null);
          request(app)
            .get('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/plist')
            .set('Content-Type', 'application/json; charset=utf-8')
            .expect(404)
            .end(function(err, res) {
              expect(err).to.be(null);
              expect(res.body).to.have.property('message');
              expect(res.body.message).to.be.eql('Compilation not found');
              return done();
            });
        });
    });
  });

  it('Update Compilation: Valid JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationInfo.version = 'X.X';

      request(app)
        .put('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send({compilation: compilationInfo})
        .expect(200)
        .end(function(err, res) {

          expect(err).to.be(null);
          expect(res.body).to.have.property('url');

          done();
        });
    });
  });

  it('Upload ACK Compilation: Valid JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    nock(resonatorConfig.host)
      .post(resonatorConfig.services.email.path)
      .reply(204);

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationInfo.version = 'X.X';

      request(app)
        .put('/api/v1/product/' + product._id + '/compilation/' + compilationInfo.compilationId + '/ack')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, res) {
          expect(err).to.be(null);
          let updatedProduct = res.body;
          let uploadedCompilation = _.where(updatedProduct.compilations, {'compilationId': compilationInfo.compilationId});
          expect(updatedProduct).not.to.be(null);
          expect(updatedProduct.compilations).to.have.length(product.compilations.length);
          expect(uploadedCompilation[0].uploaded).to.equal(true);
          expect(uploadedCompilation[0].filename).to.equal(compilationInfo.filename);
          done();
        });
    });
  });
});
