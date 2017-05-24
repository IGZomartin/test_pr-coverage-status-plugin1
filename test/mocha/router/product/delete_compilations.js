'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const resetDB = require('../../../../lib/util/reset_db');
const app = require('../../../../bin/server');
const _ = require('lodash');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';
const NON_EXISTING_PRODUCT_ID = '01f0000000000000003fabcd';

describe('Compilation Deletion', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Deletes the compilations of a valid product with existing compilations and admin User', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(204)
        .end(function(err) {
          expect(err).to.be(null);

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(200)
            .end(function(err, response) {
              expect(err).to.be(null);

              expect(response.body).to.have.property('_id');
              expect(response.body._id.toString()).to.equal(product._id.toString());
              expect(response.body).to.have.property('compilations');
              expect(response.body.compilations).to.be.empty();

              done();
            });
        });
    });
  });

  it('Deletes compilations of a valid product with no compilations and admin User', function(done) {

    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    productInfo.compilations = [];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(204)
        .end(function(err) {
          expect(err).to.be(null);

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(200)
            .end(function(err, response) {
              expect(err).to.be(null);

              expect(response.body).to.have.property('_id');
              expect(response.body._id.toString()).to.equal(product._id.toString());
              expect(response.body).to.have.property('compilations');
              expect(response.body.compilations).to.be.empty();

              done();
            });
        });
    });
  });

  it('Fails to delete the compilations of an inexisting product and admin User', function(done) {

    request(app)
      .del('/api/v1/product/' + NON_EXISTING_PRODUCT_ID + '/compilation')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .expect(404)
      .end(function(err, response) {
        expect(err).to.be(null);
        expect(response.body).to.have.property('code');
        expect(response.body.code).to.equal('NotFoundError');
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('Product not found');
        return done();
      });
  });

  it('Deletes compilations of a valid product with existing compilations and non-admin User', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(204)
        .end(function(err) {
          expect(err).to.be(null);

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
            .expect(200)
            .end(function(err, response) {
              expect(err).to.be(null);

              expect(response.body).to.have.property('_id');
              expect(response.body._id.toString()).to.equal(product._id.toString());
              expect(response.body).to.have.property('compilations');
              expect(response.body.compilations).to.be.empty();

              done();
            });
        });
    });
  });

  it('Deletes compilations of a valid product with no compilations and non-admin User', function(done) {

    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    productInfo.compilations = [];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id + '/compilation')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(204)
        .end(function(err) {
          expect(err).to.be(null);

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
            .expect(200)
            .end(function(err, response) {
              expect(err).to.be(null);

              expect(response.body).to.have.property('_id');
              expect(response.body._id.toString()).to.equal(product._id.toString());
              expect(response.body).to.have.property('compilations');
              expect(response.body.compilations).to.be.empty();

              done();
            });
        });
    });
  });

  it('Fails to delete the compilations of an inexisting product and non-admin User', function(done) {

    request(app)
      .del('/api/v1/product/' + NON_EXISTING_PRODUCT_ID + '/compilation')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
      .expect(404)
      .end(function(err, response) {
        expect(err).to.be(null);
        expect(response.body).to.have.property('code');
        expect(response.body.code).to.equal('NotFoundError');
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.equal('Product not found');
        return done();
      });
  });
});
