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

describe('Product creation', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Creates a product with valid JSON and admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send({appdata: productInfo})
      .expect(200)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('description');
        expect(res.body).to.have.property('client');

        done();
      });
  });

  it('Creates a product with valid JSON and non-admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
      .send({appdata: productInfo})
      .expect(401)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('Only admin users allowed');
        expect(res.body).to.have.property('code');
        expect(res.body.code).to.equal('UnauthorizedError');
        done();
      });
  });

  it('Creates a product with duplicate name but different client', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send({appdata: productInfo})
      .expect(200)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');
        expect(res.body.name).to.equal(productInfo.name);
        expect(res.body).to.have.property('description');
        expect(res.body.description).to.equal(productInfo.description);
        expect(res.body).to.have.property('client');
        expect(res.body.client).to.equal(productInfo.client);

        let secondProductInfo = _.clone(productInfo);
        secondProductInfo.client = 'Invent Co';
        secondProductInfo._id = secondProductInfo._id.substr(0, secondProductInfo._id.length - 1) + '3';

        request(app)
          .post('/api/v1/product')
          .set('Content-Type', 'application/json; charset=utf-8')
          .set('x-user-id', SUPERADMIN_X_USER_ID)
          .send({appdata: secondProductInfo})
          .expect(200)
          .end(function(err, res) {

            expect(err).to.be(null);
            expect(res.body).to.not.be(undefined);
            expect(res.body).to.have.property('_id');
            expect(res.body.id).to.equal(secondProductInfo._id);
            expect(res.body).to.have.property('name');
            expect(res.body.name).to.equal(secondProductInfo.name);
            expect(res.body).to.have.property('description');
            expect(res.body.description).to.equal(secondProductInfo.description);
            expect(res.body).to.have.property('client');
            expect(res.body.client).to.equal(secondProductInfo.client);
            return done();
          });
      });

  });

  it('Fails on product creation with invalid JSON and admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/invalidProduct');

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send({appdata: productInfo})
      .expect(500)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.be.eql('Product validation failed');

        done();
      });
  });

  it('Fails on product creation with invalid JSON and non-admin User', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/invalidProduct');

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
      .send({appdata: productInfo})
      .expect(401)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.be.eql('Only admin users allowed');
        done();
      });
  });

  it('Fails on product creation due to product name duplicate on same client', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send({appdata: productInfo})
      .expect(200)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('description');
        expect(res.body).to.have.property('client');

        let secondProduct = _.clone(productInfo);
        secondProduct.description = 'Some other description';
        request(app)
          .post('/api/v1/product')
          .set('Content-Type', 'application/json; charset=utf-8')
          .set('x-user-id', SUPERADMIN_X_USER_ID)
          .send({appdata: secondProduct})
          .expect(409)
          .end(function(err, res) {

            expect(err).to.be(null);
            expect(res.body).to.have.property('code');
            expect(res.body.code).to.equal('ConflictError');
            expect(res.body).to.have.property('message');
            expect(res.body.message).to.equal('There already exists a Product with the same name for client ' + secondProduct.client);
            return done();
          });
      });
  });

  it('Fails on product creation due to missing name field', function(done) {
    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    delete productInfo.name;

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send({appdata: productInfo})
      .expect(400)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('code');
        expect(res.body.code).to.equal('BadRequestError');
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('Missing name and/or client info for new product');
        return done();
      });
  });

  it('Fails on product creation due to missing client field', function(done) {
    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    delete productInfo.name;

    request(app)
      .post('/api/v1/product')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send({appdata: productInfo})
      .expect(400)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('code');
        expect(res.body.code).to.equal('BadRequestError');
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('Missing name and/or client info for new product');
        return done();
      });
  });
});
