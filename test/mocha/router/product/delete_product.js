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

describe('Product Deletion', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Fails to delete a valid product with compilations and non-admin User', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(409)
        .end(function(err, response) {
          expect(err).to.be(null);
          expect(response).not.to.be(null);
          expect(response.body).to.have.property('code');
          expect(response.body.code).to.equal('ConflictError');
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.equal('Cannot delete product with existing compilations');

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
  });

  it('Deletes a valid product with no compilations and non-admin User', function(done) {

    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    productInfo.compilations = [];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, response) {
          expect(err).to.be(null);
          expect(response).not.to.be(null);

          let deletedProduct = response.body;
          expect(deletedProduct).to.have.property('compilations');
          expect(deletedProduct.compilations).to.be.empty();
          expect(deletedProduct).to.have.property('_id');
          expect(deletedProduct._id).to.equal(product._id.toString());

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(404)
            .end(function(err, response) {
              expect(err).to.be(null);
              expect(response.body).to.have.property('message');
              expect(response.body.message).to.equal('Product not found');
              expect(response.body).to.have.property('code');
              expect(response.body.code).to.equal('NotFoundError');

              return done();
            });
        });
    });
  });

  it('Fails to delete a valid product with compilations and admin User', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(409)
        .end(function(err, response) {
          expect(err).to.be(null);
          expect(response).not.to.be(null);
          expect(response.body).to.have.property('code');
          expect(response.body.code).to.equal('ConflictError');
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.equal('Cannot delete product with existing compilations');

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
  });

  it('Deletes a valid product with no compilations and admin User', function(done) {

    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    productInfo.compilations = [];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .del('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, response) {
          expect(err).to.be(null);
          expect(response).not.to.be(null);

          let deletedProduct = response.body;
          expect(deletedProduct).to.have.property('compilations');
          expect(deletedProduct.compilations).to.be.empty();
          expect(deletedProduct).to.have.property('_id');
          expect(deletedProduct._id).to.equal(product._id.toString());

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(404)
            .end(function(err, response) {
              expect(err).to.be(null);
              expect(response.body).to.have.property('message');
              expect(response.body.message).to.equal('Product not found');
              expect(response.body).to.have.property('code');
              expect(response.body.code).to.equal('NotFoundError');

              done();
            });
        });
    });
  });
});
