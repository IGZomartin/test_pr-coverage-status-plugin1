'use strict';

const expect = require('expect.js');
const config = require('config');
const resonatorConfig = config.externalServices.resonator;
const fixtures = require('node-mongoose-fixtures');
const _ = require('lodash');
const nock = require('nock');
const userManager = require('../../../lib/managers/User');
const resetDB = require('../../../lib/util/reset_db');
const NON_ADMIN_VALID_USER = require(process.cwd() + '/test/fixtures/user/nonAdminValidUser');
const ADMIN_VALID_USER = require(process.cwd() + '/test/fixtures/user/adminValidUser');
const NON_ADMIN_WHITELIST_USER = require(process.cwd() + '/test/fixtures/user/whitelistValidUser');
const INVALID_USER = require(process.cwd() + '/test/fixtures/user/invalidUser');
const NON_EXISTING_USER = '01f0000000000000003fadbc';
const VALID_SUBSCRIPTION = '01f0000000000000006f0003';
const CLIENT_FIXTURES = require(process.cwd() + '/test/fixtures/client/Client');
const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');

describe('User: Create User', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES,
        Client: CLIENT_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Create Non-admin User via domain', function(done) {
    nock(resonatorConfig.host)
    .post(resonatorConfig.services.createIdentity.path)
    .reply(201, {
      'id': NON_ADMIN_VALID_USER._id
    });

    userManager.create(NON_ADMIN_VALID_USER, function(err, result) {

      expect(err).to.be(null);
      expect(result).to.have.property('id');
      let createdUserId = result.id;

      userManager.get(createdUserId, function(err, foundUser) {
        expect(err).to.equal(null);
        expect(foundUser).to.have.property('_id');
        expect(foundUser).to.have.property('name');
        expect(foundUser.name).to.equal(NON_ADMIN_VALID_USER.name);
        expect(foundUser).to.have.property('client');
        expect(foundUser.client).to.equal(NON_ADMIN_VALID_USER.client);
        expect(foundUser).to.have.property('email');
        expect(foundUser.email).to.equal(NON_ADMIN_VALID_USER.email);
        expect(foundUser).to.have.property('igzuser');
        expect(foundUser.igzuser).to.equal(false);
        return done();
      });
    });
  });

  it('Create Non-admin User via whitelist email', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.createIdentity.path)
      .reply(201, {
        'id': NON_ADMIN_WHITELIST_USER._id
      });

    userManager.create(NON_ADMIN_VALID_USER, function(err, result) {

      expect(err).to.be(null);
      expect(result).to.have.property('id');
      let createdUserId = result.id;

      userManager.get(createdUserId, function(err, foundUser) {
        expect(err).to.equal(null);
        expect(foundUser).to.have.property('_id');
        expect(foundUser).to.have.property('name');
        expect(foundUser.name).to.equal(NON_ADMIN_VALID_USER.name);
        expect(foundUser).to.have.property('client');
        expect(foundUser.client).to.equal(NON_ADMIN_VALID_USER.client);
        expect(foundUser).to.have.property('email');
        expect(foundUser.email).to.equal(NON_ADMIN_VALID_USER.email);
        expect(foundUser).to.have.property('igzuser');
        expect(foundUser.igzuser).to.equal(false);
        return done();
      });
    });
  });

  it('Create Admin User: Valid JSON', function(done) {

    nock(resonatorConfig.host)
    .post(resonatorConfig.services.createIdentity.path)
    .reply(201, {
      'id': ADMIN_VALID_USER._id
    });


    userManager.create(ADMIN_VALID_USER, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.have.property('id');
      let createdUserId = result.id;

      userManager.get(createdUserId, function(err, foundUser) {
        expect(err).to.equal(null);
        expect(foundUser).to.have.property('_id');
        expect(foundUser).to.have.property('name');
        expect(foundUser.name).to.equal(ADMIN_VALID_USER.name);
        expect(foundUser).to.have.property('client');
        expect(foundUser.client).to.equal('IGZ');
        expect(foundUser).to.have.property('email');
        expect(foundUser.email).to.equal(ADMIN_VALID_USER.email);
        expect(foundUser).to.have.property('igzuser');
        expect(foundUser.igzuser).to.equal(true);
        return done();
      });
    });
  });

  it('Create User: Invalid JSON via domain', function(done) {

    userManager.create(INVALID_USER, function(err, result) {

      expect(err).not.to.be(null);
      expect(result).to.be(undefined);
      expect(err).to.have.property('body');
      expect(err.body).to.have.property('message');
      expect(err.body.message).to.equal('Email already in use');
      expect(err.body).to.have.property('code');
      expect(err.body.code).to.equal('ConflictError');
      return done();
    });
  });

  it('Create User: inexisting client', function(done) {

    let user = _.clone(NON_ADMIN_VALID_USER);
    user.email = 'missing@domain.com';

    userManager.create(user, function(err, res) {
      expect(res).to.be(undefined);
      expect(err).to.have.property('body');
      expect(err.body).to.have.property('code');
      expect(err.body.code).to.equal('ConflictError');
      expect(err.body).to.have.property('message');
      expect(err.body.message).to.be.eql('Cannot register user for provided domain');
      return done();
    });
  });

  it('Create User: inexisting whitelist email', function(done) {

    let user = _.clone(NON_ADMIN_WHITELIST_USER);
    user.email = 'inexisting@user.com';

    userManager.create(user, function(err, res) {
      expect(res).to.be(undefined);
      expect(err).to.have.property('body');
      expect(err.body).to.have.property('code');
      expect(err.body.code).to.equal('ConflictError');
      expect(err.body).to.have.property('message');
      expect(err.body.message).to.be.eql('Cannot register user for provided domain');
      return done();
    });
  });

  it('Create User: duplicated email', function(done) {

    userManager.create(INVALID_USER, function(err, res) {
      expect(res).to.be(undefined);
      expect(err).to.have.property('body');
      expect(err.body).to.have.property('code');
      expect(err.body.code).to.equal('ConflictError');
      expect(err.body).to.have.property('message');
      expect(err.body.message).to.be.eql('Email already in use');
      return done();
    });
  });

  it('Update User: Create Subscription', function(done) {

    fixtures({
      User: [ADMIN_VALID_USER]
    }, function(err, data) {

      expect(err).to.be(null);

      let user = data[0][0];

      userManager.subscribe(user._id, VALID_SUBSCRIPTION, function(err) {

        expect(err).to.be(null);

        return done();
      });
    });
  });

  it('Update User: Delete Subscription', function(done) {

    fixtures({
      User: [ADMIN_VALID_USER]
    }, function(err, data) {

      expect(err).to.be(null);

      let user = data[0][0];

      userManager.unsubscribe(user._id, VALID_SUBSCRIPTION, function(err) {

        expect(err).to.be(null);

        return done();
      });
    });
  });

  it('Get User: Valid User', function(done) {


    fixtures({
      User: [NON_ADMIN_VALID_USER]
    }, function(err, data) {

      expect(err).to.be(null);

      let user = data[0][0];

      userManager.get(user._id, function(err, result) {

        expect(err).to.be(null);
        expect(result.toObject()).to.eql(user.toObject());

        return done();
      });
    });
  });

  it('Get User: non-existing User', function(done) {

    userManager.get(NON_EXISTING_USER, function(error, result) {
      expect(result).to.be(undefined);
      expect(error).to.have.property('message');
      expect(error.message).to.equal('Could not find requested user');
      expect(error).to.have.property('body');
      expect(error.body).to.have.property('code');
      expect(error.body.code).to.equal('NotFoundError');
      expect(error.body).to.have.property('message');
      expect(error.body.message).to.equal(error.message);

      return done();
    });
  });

  it('Verify User Email: Non-Superadmin Domain', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/validDomainNewUser').email;

    userManager.verifyEmail(userEmail, function(err, res) {
      expect(err).to.be(null);
      expect(res.canRegister).to.be.equal(true);
      return done();
    });
  });

  it('Verify User Email: Superadmin Domain', function(done) {

    let userEmail = 'a@' + config.get('auth.superadminDomains')[0];

    userManager.verifyEmail(userEmail, function(err, res) {
      expect(err).to.be(null);
      expect(res.canRegister).to.be.equal(true);
      return done();
    });
  });

  it('Verify User Email: Invalid Domain', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/invalidDomainNewUser').email;

    userManager.verifyEmail(userEmail, function(err, res) {
      expect(err).to.be(null);
      expect(res.canRegister).to.be.equal(false);
      return done();
    });
  });

  it('Verify User Email: Existing Email', function(done) {

    userManager.verifyEmail(USER_FIXTURES[0].email, function(err, res) {
      expect(err).not.to.be(null);
      expect(err).to.have.property('message');
      expect(err.message).to.equal('Email already in use');
      expect(err).to.have.property('body');
      expect(err.body).to.have.property('code');
      expect(err.body.code).to.equal('ConflictError');
      expect(err.body).to.have.property('message');
      expect(err.body.message).to.equal(err.message);
      expect(res).to.be(undefined);
      return done();
    });
  });

  it('Verify User Email: Badly-formatted Email', function(done) {

    let email = 'a/b@mac-int/o.sh';

    userManager.verifyEmail(email, function(err, res) {
      expect(err).not.to.be(null);
      expect(err).to.have.property('message');
      expect(err.message).to.equal('Email not valid');
      expect(err).to.have.property('body');
      expect(err.body).to.have.property('code');
      expect(err.body.code).to.equal('UnprocessableEntityError');
      expect(err.body).to.have.property('message');
      expect(err.body.message).to.equal(err.message);
      expect(res).to.be(undefined);
      return done();
    });
  });

  it('Get List of Users: non-zero offset', function(done) {

    let options = {
      pagesize: 10,
      offset: 2
    };

    userManager.list(options, function(error, userList) {
      expect(error).to.be(null);
      expect(userList).not.to.be.empty();
      expect(userList).to.have.length(USER_FIXTURES.length - options.offset);
      return done();
    });
  });
  it('Get List of Users: large pagesize', function(done) {

    let options = {
      pagesize: 10,
      offset: 0
    };

    userManager.list(options, function(error, userList) {
      expect(error).to.be(null);
      expect(userList).not.to.be.empty();
      expect(userList).to.have.length(USER_FIXTURES.length);
      return done();
    });
  });

  it('Get List of Users: small pagesize', function(done) {

    let options = {
      pageSize: 2,
      offset: 0
    };

    userManager.list(options, function(error, userList) {
      expect(error).to.be(null);
      expect(userList).not.to.be.empty();
      expect(userList).to.have.length(options.pageSize);
      return done();
    });
  });

});
