'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const resetDB = require('../../../../lib/util/reset_db');
const app = require('../../../../bin/server');
const _ = require('lodash');
const productFilter = require('./../../filter_product_data');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';

describe('Product listing', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Lists valid products with non-admin User', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let product1 = data[0][0];
      let pagesize = 10;
      let offset = 0;

      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          expect(err).to.be(null);
          expect(result.body).to.have.length(1);
          expect(result.body[0].name).to.be.eql(product1.name);
          expect(result.body[0].description).to.eql(product1.description);
          expect(result.body[0].client).to.eql(product1.client);
          expect(result.body[0].public).to.eql(product1.public);
          expect(result.body[0]).to.have.property('subscribed');
          expect(result.body[0].subscribed).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with admin User and product name filter', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let products = data[0];
      let pagesize = 10;
      let offset = 0;
      let productName = 'Monorail';

      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize + '&name=' + productName)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, result) {


          let filteredCompilationPlatforms = productFilter.getCompilationItems(_.where(products, {'name': productName}), 'platform');

          let returnedCompilationPlatforms = productFilter.getCompilationItems(result.body, 'platform');

          let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
          expect(comparison).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with non-admin User and product name filter', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let products = data[0];
      let pagesize = 10;
      let offset = 0;
      let productName = 'Pilot project';

      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize + '&name=' + productName)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, result) {


          let filteredCompilationPlatforms = productFilter.getCompilationItems(_.where(products, {'name': productName}), 'platform');

          let returnedCompilationPlatforms = productFilter.getCompilationItems(result.body, 'platform');

          let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
          expect(comparison).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with non-admin User and product platform filter', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let products = data[0];
      let pagesize = 10;
      let offset = 0;
      let productPlatform = 'ios';
      let userClient = 'DailyMail';
      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize + '&platform=' + productPlatform)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          let filteredCompilationPlatforms = productFilter.getCompilationItemsWithFilter(_.where(products, {'client': userClient}), {'platform': productPlatform}, 'platform');

          let returnedCompilationPlatforms = productFilter.getCompilationItems(result.body, 'platform');

          let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
          expect(comparison).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with admin User and product platform filter', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let products = data[0];
      let pagesize = 10;
      let offset = 0;
      let productPlatform = 'ios';

      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize + '&platform=' + productPlatform)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          let filteredCompilationPlatforms = productFilter.getCompilationItemsWithFilter(products, {'platform': productPlatform}, 'platform');

          let returnedCompilationPlatforms = productFilter.getCompilationItems(result.body, 'platform');

          let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
          expect(comparison).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with non-admin User including product platform AND product name filter', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let products = data[0];
      let pagesize = 10;
      let offset = 0;
      let productPlatform = 'ios';
      let productName = 'Pilot project';
      let userClient = 'DailyMail';
      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize + '&platform=' + productPlatform + '&name=' + productName)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          let filteredCompilationPlatforms = productFilter.getCompilationItemsWithFilter(_.where(products, {'client': userClient, name: productName}), {'platform': productPlatform}, 'platform');

          let returnedCompilationPlatforms = productFilter.getCompilationItems(result.body, 'platform');

          let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
          expect(comparison).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with admin User including product platform AND product name filter', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      let products = data[0];
      let pagesize = 10;
      let offset = 0;
      let productName = 'Monorail';
      let productPlatform = 'ios';

      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize + '&platform=' + productPlatform + '&name=' + productName)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          let filteredCompilationPlatforms = productFilter.getCompilationItemsWithFilter(_.where(products, { 'name': productName }), {'platform': productPlatform}, 'platform');

          let returnedCompilationPlatforms = productFilter.getCompilationItems(result.body, 'platform');

          let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
          expect(comparison).to.equal(true);

          done();
        });
    });
  });

  it('Lists valid products with admin User', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      data[0] = _.sortBy(data[0], function(prod) {
        return prod._id;
      });

      let product1 = data[0][0];
      let product2 = data[0][1];
      let product3 = data[0][2];
      let pagesize = 10;
      let offset = 0;

      request(app)
        .get('/api/v1/product/list?offset=' + offset + '&pagesize=' + pagesize)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .expect(200)
        .end(function(err, result) {

          result.body = _.sortBy(result.body, function(prod) {
            return prod._id;
          });

          expect(err).to.be(null);
          expect(result.body[0].name).to.be.eql(product1.name);
          expect(result.body[0].description).to.eql(product1.description);
          expect(result.body[0].client).to.eql(product1.client);
          expect(result.body[0].public).to.eql(product1.public);
          expect(result.body[0]).to.have.property('subscribed');
          expect(result.body[0].subscribed).to.equal(false);

          expect(result.body[1].name).to.be.eql(product2.name);
          expect(result.body[1].description).to.eql(product2.description);
          expect(result.body[1].client).to.eql(product2.client);
          expect(result.body[1].public).to.eql(product2.public);
          expect(result.body[1]).to.have.property('subscribed');
          expect(result.body[1].subscribed).to.equal(false);

          expect(result.body[2].name).to.be.eql(product3.name);
          expect(result.body[2].description).to.eql(product3.description);
          expect(result.body[2].client).to.eql(product3.client);
          expect(result.body[2].public).to.eql(product3.public);
          expect(result.body[2]).to.have.property('subscribed');
          expect(result.body[2].subscribed).to.equal(false);

          done();
        });
    });
  });
});
