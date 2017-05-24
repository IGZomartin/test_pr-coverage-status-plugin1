'use strict';

const mockeryAws = require('../mockery');
mockeryAws();
const expect = require('expect.js');
const mockery = require('mockery');
const fixtures = require('node-mongoose-fixtures');
const _ = require('lodash');
const nock = require('nock');
const resonatorConfig = require('config').externalServices.resonator;
const validator = require('validator');
const mongoose = require('mongoose');
const resetDB = require('../../../lib/util/reset_db');
const compilationManager = require('../../../lib/managers/Compilation');

const NON_EXISTING_PRODUCT = '01f0000000000000003fadbc';

describe('Compilation Manager', function() {

  beforeEach(resetDB.initDb);
  afterEach(resetDB.dropDb);
  after(function(done) {
    mockery.disable();
    mockery.deregisterAll();
    done();
  });

  it('Create New Compilation: success', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/validCompilation');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationManager.create(product._id, compilationInfo, function(err, result) {
        expect(err).to.be(null);
        expect(validator.isURL(result.url)).to.be(true);

        done();
      });
    });
  });

  it('Create Duplicate Compilation: creation error', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/duplicateCompilation');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationManager.create(product._id, compilationInfo, function(err, result) {

        expect(err).not.to.be(null);
        expect(err).to.have.property('message');
        expect(err.message).to.equal('A compilation with the provided version and platform already exists');
        expect(err).to.have.property('body');
        expect(err.body).to.have.property('code');
        expect(err.body.code).to.equal('ConflictError');
        expect(err.body).to.have.property('message');
        expect(err.body.message).to.equal(err.message);
        expect(result).to.be(undefined);

        done();
      });
    });
  });

  it('Create New Compilation: non-existing product', function(done) {

    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/validCompilation');

    compilationManager.create(NON_EXISTING_PRODUCT, compilationInfo, function(error, result) {

      expect(error).not.to.be(null);
      expect(error).to.have.property('message');
      expect(error.message).to.equal('Product not found');
      expect(error).to.have.property('body');
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('NotFoundError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal(error.message);
      expect(result).to.be(undefined);

      return done();
    });
  });

  it('Create New Compilation: invalid data', function(done) {

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = require(process.cwd() + '/test/fixtures/compilation/invalidCompilation');

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationManager.create(product._id, compilationInfo, function(error, result) {

        expect(error).not.to.be(null);
        expect(error).to.have.property('message');
        expect(error.message).to.equal('Could not create compilation');
        expect(error).to.have.property('body');
        expect(error.body).to.have.property('code');
        expect(error.body.code).to.equal('BadRequestError');
        expect(error.body).to.have.property('message');
        expect(error.body.message).to.equal(error.message);
        expect(result).to.be(undefined);

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

      compilationManager.delete(product._id, compilationInfo.compilationId, function(err, result) {

        expect(err).to.be(null);
        expect(_.find(result.compilations, {compilationId: compilationInfo.compilationId})).to.be(undefined);

        done();

      });
    });
  });

  it('Download Compilation: Valid iOS JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationManager.download(product._id, compilationInfo.compilationId, function(err, result) {

        expect(err).to.be(null);
        expect(validator.isURL(result.url)).to.be(true);

        done();
      });
    });
  });

  it('Download Compilation: Valid JSON', function(done) {
    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];
    compilationInfo.uploaded = true;
    compilationInfo.platform = 'android';

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationManager.download(product._id, compilationInfo.compilationId, function(err, result) {

        expect(err).to.be(null);
        expect(validator.isURL(result.url)).to.be(true);

        done();
      });
    });
  });

  it('Upload ACK Compilation: Valid JSON', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.email.path)
      .reply(204);

    let productInfo = require(process.cwd() + '/test/fixtures/product/validProduct');
    let compilationInfo = productInfo.compilations[0];

    fixtures({
      Product: [productInfo]
    }, function(err, data) {

      expect(err).to.be(null);

      let product = data[0][0];

      compilationManager.uploadAck(product._id, compilationInfo.compilationId, function(err, updatedProduct) {
        expect(err).to.be(null);
        expect(updatedProduct).not.to.be(null);
        expect(updatedProduct.compilations).to.have.length(product.compilations.length);
        let uploadedCompilation = _.where(updatedProduct.compilations, {'compilationId': new mongoose.Types.ObjectId(compilationInfo.compilationId)});
        expect(uploadedCompilation[0].uploaded).to.equal(true);
        return done();
      });
    });
  });
});
