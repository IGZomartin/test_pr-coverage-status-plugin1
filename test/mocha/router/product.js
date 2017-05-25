'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const resetDB = require('../../../lib/util/reset_db');
const app = require('../../../bin/server');
const _ = require('lodash');
const productFilter = require('./../filter_product_data');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';
const SOME_OTHER_USER = '01f0000000000000003f0002';

describe('Product Router', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Create Product: Valid JSON and admin User', function(done) {
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

  it('Create Product: Valid JSON and non-admin User', function(done) {
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

  it('Create product: Invalid JSON and admin User', function(done) {
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

  it('Create product: Invalid JSON and non-admin User', function(done) {
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

  it('Update product: Change description and admin User', function(done) {
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


  it('Update product: Change description and non-admin User', function(done) {
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

  it('Get product: Valid product and User belonging to product client', function(done) {

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

  it('Get product: Valid product and admin User', function(done) {

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

  it('Get product: Valid product and User NOT belonging to product client', function(done) {

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

  it('Get product: non-existing Product with non-admin User', function(done) {

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

  it('Get product list: Valid products with non-admin User', function(done) {

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

          done();
        });
    });
  });

  it('Get product list: Valid products with admin User with product name filter', function(done) {

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

  it('Get product list: Valid products with non-admin User with product name filter', function(done) {

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

  it('Get product list: Valid products with non-admin User with product platform filter', function(done) {

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

  it('Get product list: Valid products with admin User with product platform filter', function(done) {

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

  it('Get product list: Valid products with non-admin User with product platform AND product name filter', function(done) {

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

  it('Get product list: Valid products with admin User with product platform AND product name filter', function(done) {

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

  it('Get product list: Valid products with admin User', function(done) {

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

          expect(result.body[1].name).to.be.eql(product2.name);
          expect(result.body[1].description).to.eql(product2.description);
          expect(result.body[1].client).to.eql(product2.client);
          expect(result.body[1].public).to.eql(product2.public);

          expect(result.body[2].name).to.be.eql(product3.name);
          expect(result.body[2].description).to.eql(product3.description);
          expect(result.body[2].client).to.eql(product3.client);
          expect(result.body[2].public).to.eql(product3.public);

          done();
        });
    });
  });

  it('Get Product Icon: valid productId', function(done) {

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

  it('Get Product Icon: invalid product', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/productList');
    let invalidProductId = '01f0000000000000003fasdf';

    fixtures({
      Product: productInfo
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/images/' + invalidProductId + '.png')
        .expect(404)
        .end(function(error, response) {
          expect(error).to.be(null);
          expect(response.body).to.have.property('code');
          expect(response.body.code).to.equal('NotFoundError');
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.equal('Product not found');
          return done();
        });
    });
  });

  it('Get Product Icon: valid Product without icon', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/productList');
    let productWithoutIconId = productInfo[1]._id;

    fixtures({
      Product: productInfo
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/images/' + productWithoutIconId + '.png')
        .expect(404)
        .end(function(error, response) {
          expect(error).to.be(null);
          expect(response.body).to.have.property('code');
          expect(response.body.code).to.equal('NotFoundError');
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.equal('Product has no icon');
          return done();
        });
    });
  });
});
