'use strict';

const expect = require('expect.js');
const verifyClient = require('../../../lib/middlewares/verify_client');
const fixtures = require('node-mongoose-fixtures');
const resetDB = require('../../../lib/util/reset_db');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const PRODUCT_FIXTURES = require(process.cwd() + '/test/fixtures/product/productList');

let PRODUCT, NON_ADMIN_USER, ADMIN_USER, SOME_OTHER_USER;

describe('Verify Client Middleware', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES,
        Product: PRODUCT_FIXTURES
      }, function(err, result) {
        NON_ADMIN_USER = result[0][0];
        SOME_OTHER_USER = result[0][1];
        ADMIN_USER = result[0][3];
        PRODUCT = result[1][0];
        return done();
      });
    });
  });

  afterEach(resetDB.dropDb);

  it('Target Product URL with non-admin user belonging to product client', function(done) {

    let request = {
      path: '/api/v1/product/' + PRODUCT._id + '/compilation',
      method: 'GET',
      headers: {
        'x-user-id': NON_ADMIN_USER._id
      }
    };
    request.user = NON_ADMIN_USER;
    request.isAdmin = NON_ADMIN_USER.igzuser;

    let response = {};

    verifyClient()(request, response, function(error) {
      expect(error).to.be(undefined);
      return done();
    });
  });

  it('Target Product URL with non-admin user NOT belonging to product client', function(done) {

    let request = {
      path: '/api/v1/product/' + PRODUCT._id + '/compilation',
      method: 'GET',
      headers: {
        'x-user-id': SOME_OTHER_USER._id
      }
    };
    request.user = SOME_OTHER_USER;
    request.isAdmin = SOME_OTHER_USER.igzuser;

    let response = {};

    verifyClient()(request, response, function(error) {
      expect(error).not.to.be(null);
      expect(error).to.have.property('message');
      expect(error.message).to.equal('Not allowed');
      expect(error).to.have.property('body');
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('ForbiddenError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal(error.message);
      return done();
    });
  });

  it('Target Product URL with admin user NOT belonging to product client', function(done) {

    let request = {
      path: '/api/v1/product/' + PRODUCT._id + '/compilation',
      method: 'GET',
      headers: {
        'x-user-id': ADMIN_USER._id
      }
    };
    request.user = ADMIN_USER;
    request.isAdmin = ADMIN_USER.igzuser;

    let response = {};

    verifyClient()(request, response, function(error) {
      expect(error).to.be(undefined);
      return done();
    });
  });
});
