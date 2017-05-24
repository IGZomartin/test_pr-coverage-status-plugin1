'use strict';
const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const _ = require('lodash');
const resetDB = require('../../../../lib/util/reset_db');
const app = require('../../../../bin/server');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';

describe('Product Update', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Change product description with admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let productUpd = {
      description: 'New Description'
    };


    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .put('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send({appdata: productUpd})
        .expect(204)
        .end(function(err) {
          expect(err).to.be(null);
          done();
        });
    });
  });

  it('Change product name with admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let productUpd = {
      name: 'Another Name'
    };


    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .put('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send({appdata: productUpd})
        .expect(204)
        .end(function(err) {
          expect(err).to.be(null);

          request(app)
            .get('/api/v1/product/' + product._id)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(200)
            .end(function(error, response) {
              expect(error).to.be(null);
              let updatedProduct = response.body;
              expect(updatedProduct).to.have.property('name');
              expect(updatedProduct.name).to.equal(productUpd.name);
              _.forEach(updatedProduct.compilations, function(compilation, key) {
                expect(compilation.filePath).to.equal(product.compilations[key].filePath);
              });
              return done();
            });
        });
    });
  });

  it('Change product description with non-admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let productUpd = {
      description: 'New Description'
    };


    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .put('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .send({appdata: productUpd})
        .expect(401)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.eql('Only admin users allowed');
          done();
        });
    });
  });

  it('Change product name with non-admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let productUpd = {
      name: 'Another name'
    };


    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      request(app)
        .put('/api/v1/product/' + product._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .send({appdata: productUpd})
        .expect(401)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.be.eql('Only admin users allowed');
          done();
        });
    });
  });

});
