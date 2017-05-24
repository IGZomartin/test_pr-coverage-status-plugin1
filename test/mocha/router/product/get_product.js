'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const resetDB = require('../../../../lib/util/reset_db');
const app = require('../../../../bin/server');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';
const SOME_OTHER_USER = '01f0000000000000003f0002';

describe('Product fetching', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Gets a valid product with User belonging to product client', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          expect(err).to.be(null);
          expect(result.body.name).to.be.eql(productInfo.name);
          expect(result.body.description).to.eql(productInfo.description);
          expect(result.body.client).to.eql(productInfo.client);
          expect(result.body.public).to.eql(productInfo.public);

          done();
        });
    });
  });

  it('Gets a valid product with admin User', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          expect(err).to.be(null);
          expect(result.body.name).to.be.eql(productInfo.name);
          expect(result.body.description).to.eql(productInfo.description);
          expect(result.body.client).to.eql(productInfo.client);
          expect(result.body.public).to.eql(productInfo.public);

          done();
        });
    });
  });

  it('Fails to get a valid product with User NOT belonging to product client', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .get('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SOME_OTHER_USER)
        .expect(403)
        .end(function(err, res) {

          expect(err).to.be(null);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.eql('Not allowed');

          done();
        });
    });
  });

  it('Fails to get a non-existing Product with non-admin User', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let NON_EXISTING_PRODUCT_ID = '01f0000000000000003fabcd';

    fixtures({
      Product: [productInfo]
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/api/v1/product/' + NON_EXISTING_PRODUCT_ID)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SOME_OTHER_USER)
        .expect(404)
        .end(function(err, res) {

          expect(err).to.be(null);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.eql('Product not found');
          expect(res.body).to.have.property('code');
          expect(res.body.code).to.equal('NotFoundError');
          return done();
        });
    });
  });
});
