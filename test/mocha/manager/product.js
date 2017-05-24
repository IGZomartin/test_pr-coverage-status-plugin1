'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const productManager = require('../../../lib/managers/Product');
const urlConstructor = require('../../../lib/util/url_constructor');
const resetDB = require('../../../lib/util/reset_db');
const _ = require('lodash');
const productFilter = require('./../filter_product_data');
const NON_EXISTING_PRODUCT_ID = '01f0000000000000003fabcd';

describe('Product: Create Product', function() {

  beforeEach(resetDB.initDb);
  afterEach(resetDB.dropDb);

  it('Create Product: Valid JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    productManager.create(productInfo, function(err, result) {

      expect(err).to.be(null);
      expect(result.name).to.eql(productInfo.name);
      expect(result.description).to.eql(productInfo.description);
      expect(result.client).to.eql(productInfo.client);
      expect(result.public).to.eql(productInfo.public);
      expect(result.iconUrl).to.eql(urlConstructor.getProductImageRelativeUrl(productInfo));
      expect(result.environment).to.eql(productInfo.environment);

      done();
    });
  });

  it('Create Product: Valid JSON without icon', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let product = _.clone(productInfo);
    delete product.icon;

    productManager.create(product, function(err, result) {

      expect(err).to.be(null);
      expect(result.name).to.eql(product.name);
      expect(result.description).to.eql(product.description);
      expect(result.client).to.eql(product.client);
      expect(result.public).to.eql(product.public);
      expect(result).to.not.have.property('icon');
      expect(result.iconUrl).to.equal('');
      expect(result.environment).to.eql(product.environment);

      done();
    });
  });

  it('Create Product: creates product with existing name but different client', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    productManager.create(productInfo, function(error, createdProduct) {
      expect(error).to.be(null);
      expect(createdProduct).to.not.be(undefined);
      expect(createdProduct).to.have.property('_id');
      expect(createdProduct.id).to.equal(productInfo._id);
      expect(createdProduct).to.have.property('name');
      expect(createdProduct.name).to.equal(productInfo.name);
      expect(createdProduct).to.have.property('client');
      expect(createdProduct.client).to.equal(productInfo.client);

      let secondProductInfo = _.clone(productInfo);
      secondProductInfo.client = 'Invent Co';
      secondProductInfo._id = secondProductInfo._id.substr(0, secondProductInfo._id.length - 1) + '3';

      productManager.create(secondProductInfo, function(error, createdProduct) {
        expect(error).to.be(null);
        expect(createdProduct).to.not.be(undefined);
        expect(createdProduct).to.have.property('_id');
        expect(createdProduct.id).to.equal(secondProductInfo._id);
        expect(createdProduct).to.have.property('name');
        expect(createdProduct.name).to.equal(secondProductInfo.name);
        expect(createdProduct).to.have.property('client');
        expect(createdProduct.client).to.equal(secondProductInfo.client);
        return done();
      });
    });
  });

  it('Create Product: fails due to missing \'name\' field', function(done) {
    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    delete productInfo.name;

    productManager.create(productInfo, function(error, createdProduct) {
      expect(error).not.to.be(null);
      expect(createdProduct).to.be(undefined);
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('BadRequestError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal('Missing name and/or client info for new product');
      return done();
    });
  });

  it('Create Product: fails due to missing \'client\' field', function(done) {
    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    delete productInfo.client;

    productManager.create(productInfo, function(error, createdProduct) {
      expect(error).not.to.be(null);
      expect(createdProduct).to.be(undefined);
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('BadRequestError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal('Missing name and/or client info for new product');
      return done();
    });
  });

  it('Create Product: fails due to duplicate name for same client', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    productManager.create(productInfo, function(error, createdProduct) {
      expect(error).to.be(null);
      expect(createdProduct).to.not.be(undefined);
      expect(createdProduct).to.have.property('_id');
      expect(createdProduct.id).to.equal(productInfo._id);
      expect(createdProduct).to.have.property('name');
      expect(createdProduct.name).to.equal(productInfo.name);
      expect(createdProduct).to.have.property('client');
      expect(createdProduct.client).to.equal(productInfo.client);

      let dupProductInfo = _.clone(productInfo);

      productManager.create(dupProductInfo, function(error, createdProduct) {
        expect(error).not.to.be(null);
        expect(createdProduct).to.be(undefined);
        expect(error.body).to.have.property('code');
        expect(error.body.code).to.equal('ConflictError');
        expect(error.body).to.have.property('message');
        expect(error.body.message).to.equal('There already exists a Product with the same name for client ' + dupProductInfo.client);
        return done();
      });
    });
  });

  it('Delete Product: Valid Product with existing compilations', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      productManager.delete(product._id, function(err) {

        expect(err).not.to.be(null);
        expect(err.body).to.have.property('message');
        expect(err.body.message).to.equal('Cannot delete product with existing compilations');
        expect(err.body).to.have.property('code');
        expect(err.body.code).to.equal('ConflictError');

        productManager.get(product._id, function(err, foundProduct) {
          expect(err).to.be(null);
          expect(foundProduct).to.not.be(undefined);
          expect(foundProduct).to.have.property('_id');
          expect(foundProduct._id.toString()).to.equal(product._id.toString());
          expect(foundProduct).to.have.property('compilations');
          expect(foundProduct.compilations).to.have.length(foundProduct.compilations.length);
          return done();
        });
      });
    });
  });

  it('Delete Product: Valid product with no compilations', function(done) {
    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    productInfo.compilations = [];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      productManager.delete(product._id, function(err) {

        expect(err).to.be(null);

        productManager.get(product._id, function(err, foundProduct) {
          expect(err).not.to.be(null);
          expect(foundProduct).to.be(undefined);
          expect(err.body).to.have.property('code');
          expect(err.body.code).to.equal('NotFoundError');
          expect(err.body).to.have.property('message');
          expect(err.body.message).to.equal('Product not found');
          return done();
        });
      });
    });
  });

  it('Delete all compilations: Valid Product with existing compilations', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      productManager.removeAllCompilations(product._id, function(err) {

        expect(err).to.be(null);

        productManager.get(product._id, function(err, foundProduct) {
          expect(err).to.be(null);
          expect(foundProduct).not.to.be(undefined);
          expect(foundProduct).to.have.property('_id');
          expect(foundProduct._id.toString()).to.equal(product._id.toString());
          expect(foundProduct).to.have.property('compilations');
          expect(foundProduct.compilations).to.be.empty();
          return done();
        });
      });
    });
  });

  it('Delete all compilations: Valid Product with no compilations', function(done) {
    let productInfo = _.clone(require(process.cwd() + '/test/fixtures/product/validProduct'));
    productInfo.compilations = [];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      productManager.removeAllCompilations(product._id, function(err) {

        expect(err).to.be(null);

        productManager.get(product._id, function(err, foundProduct) {
          expect(err).to.be(null);
          expect(foundProduct).not.to.be(undefined);
          expect(foundProduct).to.have.property('_id');
          expect(foundProduct._id.toString()).to.equal(product._id.toString());
          expect(foundProduct).to.have.property('compilations');
          expect(foundProduct.compilations).to.be.empty();
          return done();
        });
      });
    });
  });

  it('Delete all compilations: Non existing product', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err) {

      expect(err).to.be(null);

      productManager.removeAllCompilations(NON_EXISTING_PRODUCT_ID, function(err) {

        expect(err).not.to.be(null);
        expect(err.body).to.have.property('code');
        expect(err.body.code).to.equal('NotFoundError');
        expect(err.body).to.have.property('message');
        expect(err.body.message).to.equal('Product not found');
        return done();
      });
    });
  });

  it('Get Product: Valid Product', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0].toObject();
      product.icon = product.icon.toString('utf-8');

      productManager.get(product._id, function(err, result) {
        expect(err).to.be(null);
        expect(result.name).to.eql(product.name);
        expect(result.description).to.eql(product.description);
        expect(result.client).to.eql(product.client);
        expect(result.public).to.eql(product.public);
        expect(result.iconUrl).to.eql(urlConstructor.getProductImageRelativeUrl(product));
        expect(result.environment).to.eql(product.environment);
        return done();
      });
    });
  });

  it('Get Product: non-existing Product', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');
    let nonExistingProductId = '01f0000000000000024fadbc';

    fixtures({
      Product: productList
    }, function(err) {

      expect(err).to.be(null);

      productManager.get(nonExistingProductId, function(error, result) {
        expect(result).to.be(undefined);
        expect(error).to.have.property('message');
        expect(error.message).to.equal('Product not found');
        expect(error).to.have.property('body');
        expect(error.body).to.have.property('code');
        expect(error.body.code).to.equal('NotFoundError');
        expect(error.body).to.have.property('message');
        expect(error.body.message).to.equal(error.message);
        done();
      });
    });
  });

  it('Update Product: Valid Product', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let productUpd = {
      description: 'New Description'
    };

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      productManager.update(product._id, productUpd, function(err, result) {

        expect(err).to.be(null);
        expect(result.description).to.be.eql(productUpd.description);

        done();
      });
    });
  });

  it('List Product: Valid List Product for admin user without filters', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let adminUser = {
      igzuser: true
    };

    let options = {
      offset: 0,
      pageSize: 10
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(adminUser, options, function(err, result ) {
        expect(err).to.be(null);
        let expectedProductIds = productFilter.getProductIds(products);
        let foundProductIds = productFilter.getProductIds(result);

        let comparison = _.isEqual(expectedProductIds.sort(), foundProductIds.sort());
        expect(comparison).to.be.equal(true);

        done();
      });
    });
  });

  it('List Product: Valid List Product for non-admin user without filters', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let nonAdminUser = {
      igzuser: false,
      client: 'BitBank'
    };

    let options = {
      offset: 0,
      pageSize: 10
    };

    fixtures({
      Product: productList
    }, function(err, data) {

      expect(err).to.be(null);

      productManager.list(nonAdminUser, options, function(err, result) {

        let expectedProductIds = _.map(_.where(data[0], { client: nonAdminUser.client}), function(prod) {
          return prod._id.toHexString();
        });

        let foundProductIds = _.map(result, function(prod) {
          return prod._id.toHexString();
        });

        let comparison = _.isEqual(expectedProductIds.sort(), foundProductIds.sort());
        expect(comparison).to.be.equal(true);

        done();
      });
    });
  });

  it('List Product: Valid List Product for admin user filtered by product platform', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let adminUser = {
      igzuser: true
    };

    let options = {
      offset: 0,
      pageSize: 10,
      productPlatform: 'ios'
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(adminUser, options, function(err, result ) {
        expect(err).to.be(null);
        let filteredCompilationIds = productFilter.getCompilationIdsWithFilter(products, {'platform': options.productPlatform});

        let returnedCompilationIds = productFilter.getCompilationIds(result);

        let comparison = _.isEqual(filteredCompilationIds.sort(), returnedCompilationIds.sort());
        expect(comparison).to.equal(true);
        done();
      });
    });
  });

  it('List Product: Valid List Product for non-admin user filtered by product platform', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let nonAdminUser = {
      igzuser: false,
      client: 'DailyMail'
    };

    let options = {
      offset: 0,
      pageSize: 10,
      productPlatform: 'ios'
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(nonAdminUser, options, function(err, result ) {
        expect(err).to.be(null);

        let filteredCompilationIds = productFilter.getCompilationIdsWithFilter(_.where(products, { 'client': nonAdminUser.client}), {'platform': options.productPlatform});
        let returnedCompilationIds = productFilter.getCompilationIds(result);

        let comparison = _.isEqual(filteredCompilationIds.sort(), returnedCompilationIds.sort());
        expect(comparison).to.equal(true);
        done();
      });
    });
  });

  it('List Product: Valid List Product for admin user filtered by product name', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let adminUser = {
      igzuser: true
    };

    let options = {
      offset: 0,
      pageSize: 10,
      productName: 'Monorail'
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(adminUser, options, function(err, result ) {
        expect(err).to.be(null);

        let filteredCompilationIds = productFilter.getCompilationIdsWithFilter(_.where(products, {'name': options.productName}));

        let returnedCompilationIds = productFilter.getCompilationIds(result);

        let comparison = _.isEqual(filteredCompilationIds.sort(), returnedCompilationIds.sort());
        expect(comparison).to.equal(true);
        done();
      });
    });
  });

  it('List Product: Valid List Product for non-admin user filtered by product name', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let nonAdminUser = {
      igzuser: false,
      client: 'DailyMail'
    };

    let options = {
      offset: 0,
      pageSize: 10,
      productName: 'Pilot project'
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(nonAdminUser, options, function(err, result ) {
        expect(err).to.be(null);

        let filteredCompilationIds = productFilter.getCompilationIds(_.where(products, {'name': options.productName}));

        let returnedCompilationIds = productFilter.getCompilationIds(result);

        let comparison = _.isEqual(filteredCompilationIds.sort(), returnedCompilationIds.sort());
        expect(comparison).to.equal(true);
        done();
      });
    });
  });

  it('List Product: Valid List Product for admin user filtered by product name AND product platform', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let adminUser = {
      igzuser: true
    };

    let options = {
      offset: 0,
      pageSize: 10,
      productName: 'Monorail',
      productPlatform: 'ios'
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(adminUser, options, function(err, result ) {
        expect(err).to.be(null);

        let filteredCompilationPlatforms = productFilter.getCompilationItemsWithFilter(_.where(products, { 'name': options.productName }), {'platform': options.productPlatform}, 'platform');

        let returnedCompilationPlatforms = productFilter.getCompilationItems(result, 'platform');

        let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
        expect(comparison).to.equal(true);
        done();
      });
    });
  });

  it('List Product: Valid List Product for non-admin user filtered by product name AND product platform', function(done) {

    let productList = require(process.cwd() + '/test/fixtures/product/productList');

    let nonAdminUser = {
      igzuser: false,
      client: 'DailyMail'
    };

    let options = {
      offset: 0,
      pageSize: 10,
      productName: 'Pilot project',
      productPlatform: 'ios'
    };

    fixtures({
      Product: productList
    }, function(err, data) {
      expect(err).to.be(null);

      let products = data[0];

      productManager.list(nonAdminUser, options, function(err, result ) {
        expect(err).to.be(null);

        let filteredCompilationPlatforms = productFilter.getCompilationItemsWithFilter(_.where(products, { 'name': options.productName }), {'platform': options.productPlatform}, 'platform');

        let returnedCompilationPlatforms = productFilter.getCompilationItems(result, 'platform');

        let comparison = _.isEqual(returnedCompilationPlatforms.sort(), filteredCompilationPlatforms.sort());
        expect(comparison).to.equal(true);
        done();
      });
    });
  });

});
