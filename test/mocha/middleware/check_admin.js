'use strict';

const expect = require('expect.js');
const checkAdmin = require('../../../lib/middlewares/check_admin');
const fixtures = require('node-mongoose-fixtures');
const resetDB = require('../../../lib/util/reset_db');

const ADMIN_X_USER_ID = '01f0000000000000003f0004';
const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
let NON_ADMIN_USER, ADMIN_USER;
describe('Check Admin Middleware', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, function(err, result) {
        NON_ADMIN_USER = result[0][0];
        ADMIN_USER = result[0][3];
        return done();
      });
    });
  });

  afterEach(resetDB.dropDb);

  it('Target non-admin URL with non-admin user', function(done) {

    let request = {
      path: '/api/v1/product',
      method: 'GET',
      headers: {
        'x-user-id': NON_ADMIN_USER._id
      }
    };
    request.user = NON_ADMIN_USER;

    let response = {};

    checkAdmin()(request, response, function(error) {
      expect(error).to.be(undefined);
      expect(request).to.have.property('isAdmin');
      expect(request.isAdmin).to.equal(false);
      return done();
    });
  });

  it('Target non-admin URL with admin User', function(done) {

    let request = {
      path: '/api/v1/product',
      method: 'GET',
      headers: {
        'x-user-id': ADMIN_USER._id
      }
    };

    request.user = ADMIN_USER;

    let response = {};

    checkAdmin()(request, response, function(error) {
      expect(error).to.be(undefined);
      expect(request).to.have.property('isAdmin');
      expect(request.isAdmin).to.equal(true);
      return done();
    });
  });

  it('Target admin URL with non-admin User', function(done) {
    let request = {
      path: '/api/v1/client',
      method: 'POST',
      headers: {
        'x-user-id': NON_ADMIN_USER
      }
    };
    request.user = NON_ADMIN_USER;

    let response = {};

    checkAdmin()(request, response, function(error) {
      expect(error).to.not.be(undefined);
      expect(error).to.have.property('message');
      expect(error.message).to.equal('Only admin users allowed');
      expect(error).to.have.property('body');
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('UnauthorizedError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal('Only admin users allowed');
      expect(request).to.have.property('isAdmin');
      expect(request.isAdmin).to.equal(false);
      return done();
    });
  });

  it('Target admin URL with admin User', function(done) {
    let request = {
      path: '/api/v1/client',
      method: 'POST',
      headers: {
        'x-user-id': ADMIN_X_USER_ID
      }
    };
    request.user = ADMIN_USER;

    let response = {};

    checkAdmin()(request, response, function(error) {
      expect(error).to.be(undefined);
      expect(request).to.have.property('isAdmin');
      expect(request.isAdmin).to.equal(true);
      return done();
    });
  });
});
