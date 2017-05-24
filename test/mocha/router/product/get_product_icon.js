'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const config = require('config');
const resetDB = require('../../../../lib/util/reset_db');
const app = require('../../../../bin/server');
const urlConstructor = require('../../../../lib/util/url_constructor');
const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');

const httpHost = urlConstructor.switchToHttp(config.get('host'));

describe('Product Icon fetching', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Gets Product icon for valid productId', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/productList');
    let validProductId = productInfo[0]._id;

    fixtures({
      Product: productInfo
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/images/' + validProductId + '.png')
        .expect(200)
        .end(function(error, response) {
          expect(error).to.be(null);
          expect(response.body).to.not.be(null);
          expect(response.body).to.be.a(Buffer);
          return done();
        });
    });
  });

  it('Gets default Product icon for invalid product id', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/productList');
    let invalidProductId = '01f0000000000000003fasdf';

    fixtures({
      Product: productInfo
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/images/' + invalidProductId + '.png')
        .expect(301)
        .end(function(error, response) {
          expect(error).to.be(null);
          expect(response.body).to.not.be(null);
          let expectedUrl = httpHost + config.get('paths.defaultProductImage');
          expect(response.headers.location).to.equal(expectedUrl);
          return done();
        });
    });
  });

  it('Gets default Product icon for Product without icon', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/productList');
    let productWithoutIconId = productInfo[1]._id;

    fixtures({
      Product: productInfo
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/images/' + productWithoutIconId + '.png')
        .expect(301)
        .end(function(error, response) {
          expect(error).to.be(null);
          expect(response.body).to.not.be(null);
          let expectedUrl = httpHost + config.get('paths.defaultProductImage');
          expect(response.headers.location).to.equal(expectedUrl);
          return done();
        });
    });
  });
});
