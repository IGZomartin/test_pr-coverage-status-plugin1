'use strict';

const expect = require('expect.js');
const validateUser = require('../../../lib/middlewares/validate_user');
const fixtures = require('node-mongoose-fixtures');
const resetDB = require('../../../lib/util/reset_db');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const EXISTING_USER_ID = '01f0000000000000003f0001';
const NON_EXISTING_USER_ID = '01f0000000000000003f0020';

describe('Check Validate User Middleware', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Target middleware with ID of existing user', function(done) {

    let request = {
      path: '/api/v1/product',
      method: 'GET',
      headers: {
        'x-user-id': EXISTING_USER_ID
      }
    };
    request.session = {};

    let response = {};

    validateUser()(request, response, function(error) {
      expect(error).to.be(undefined);
      expect(request).to.have.property('user');
      expect(request.user._id.toString()).to.equal(EXISTING_USER_ID);
      return done();
    });
  });

  it('Target middleware with ID of non-existing user', function(done) {

    let request = {
      path: '/api/v1/product',
      method: 'GET',
      headers: {
        'x-user-id': NON_EXISTING_USER_ID
      }
    };
    request.session = {};

    let response = {};

    validateUser()(request, response, function(error) {
      expect(error).to.not.be(undefined);
      expect(error).to.have.property('message');
      expect(error.message).to.equal('Could not find requested user');
      expect(error).to.have.property('body');
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('NotFoundError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal(error.message);
      expect(request).to.not.have.property('user');
      return done();
    });
  });

});
