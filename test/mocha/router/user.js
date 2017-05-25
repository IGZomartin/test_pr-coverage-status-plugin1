'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const request = require('supertest');
const nock = require('nock');
const config = require('config');
const resonatorConfig = config.externalServices.resonator;
const _ = require('lodash');
const resetDB = require('../../../lib/util/reset_db');
const app = require('../../../bin/server');

const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';
const NON_ADMIN_X_USER_ID = '01f0000000000000003f0001';
const NON_ADMIN_VALID_USER = require(process.cwd() + '/test/fixtures/user/nonAdminValidUser');
const NON_ADMIN_WHITELIST_USER = require(process.cwd() + '/test/fixtures/user/whitelistValidUser');
const ADMIN_VALID_USER = require(process.cwd() + '/test/fixtures/user/adminValidUser');
const DUPLICATED_USER = require(process.cwd() + '/test/fixtures/user/invalidUser');
const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const CLIENT_FIXTURES = require(process.cwd() + '/test/fixtures/client/Client');
const NON_EXISTING_USER = '01f0000000000000003fadbc';

describe('User Router', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES,
        Client: CLIENT_FIXTURES
      }, function() {
        return done();
      });
    });
  });

  afterEach(resetDB.dropDb);

  it('Create non-admin User: valid JSON via domain', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.createIdentity.path)
      .reply(201, {
        'id': NON_ADMIN_VALID_USER._id
      });

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(NON_ADMIN_VALID_USER)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.have.property('id');

        let newUserId = res.body.id;

        request(app)
          .get('/api/v1/user')
          .set('Content-Type', 'application/json; charset=utf-8')
          .set('x-user-id', newUserId)
          .expect(200)
          .end(function(err, res) {
            expect(err).to.be(null);
            expect(res.body).to.have.property('igzuser');
            expect(res.body.igzuser).to.equal(false);
            return done();
          });
      });
  });

  it('Create non-admin User: valid JSON via whitelist email', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.createIdentity.path)
      .reply(201, {
        'id': NON_ADMIN_VALID_USER._id
      });

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(NON_ADMIN_WHITELIST_USER)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.have.property('id');

        let newUserId = res.body.id;

        request(app)
          .get('/api/v1/user')
          .set('Content-Type', 'application/json; charset=utf-8')
          .set('x-user-id', newUserId)
          .expect(200)
          .end(function(err, res) {
            expect(err).to.be(null);
            expect(res.body).to.have.property('igzuser');
            expect(res.body.igzuser).to.equal(false);
            return done();
          });
      });
  });

  it('Create admin User: Valid JSON', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.createIdentity.path)
      .reply(201, {
        'id': NON_ADMIN_VALID_USER._id,
      });

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(ADMIN_VALID_USER)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.have.property('id');

        let newUserId = res.body.id;

        request(app)
          .get('/api/v1/user')
          .set('Content-Type', 'application/json; charset=utf-8')
          .set('x-user-id', newUserId)
          .expect(200)
          .end(function(err, res) {
            expect(err).to.be(null);
            expect(res.body).to.have.property('igzuser');
            expect(res.body.igzuser).to.equal(true);
            return done();
          });
      });
  });

  it('Create User: inexisting client', function(done) {

    let user = _.clone(NON_ADMIN_VALID_USER);
    user.email = 'missing@email.com';

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(user)
      .expect(409)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.be.eql('Cannot register user for provided domain');

        done();
      });
  });

  it('Create User: inexisting whitelist email', function(done) {

    let user = _.clone(NON_ADMIN_WHITELIST_USER);
    user.email = 'inexisting@user.com';

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(user)
      .expect(409)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.be.eql('Cannot register user for provided domain');

        done();
      });
  });

  it('Create User: duplicated email', function(done) {

    request(app)
      .post('/api/v1/user')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(DUPLICATED_USER)
      .expect(409)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.be.eql('Email already in use');

        done();
      });
  });

  it('Update User: Create Subscription for admin user', function(done) {
    let newSubscription = '01f0000000000000006faaaa';

    request(app)
      .post('/api/v1/product/' + newSubscription + '/subscribe')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .expect(204)
      .end(function(err) {

        expect(err).to.be(null);

        done();
      });
  });

  it('Update User: Create Subscription for non-admin user', function(done) {
    let newSubscription = '01f0000000000000006faaaa';

    request(app)
      .post('/api/v1/product/' + newSubscription + '/subscribe')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_X_USER_ID)
      .expect(204)
      .end(function(err) {

        expect(err).to.be(null);

        done();
      });
  });

  it('Update User: Delete Subscription for admin User', function(done) {

    let subscriptionToRemove = '01f0000000000000006faaaa';

    request(app)
      .del('/api/v1/product/' + subscriptionToRemove + '/subscribe')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .expect(200)
      .end(function(err) {

        expect(err).to.be(null);

        done();
      });
  });

  it('Update User: Delete Subscription for non-admin User', function(done) {

    let subscriptionToRemove = '01f0000000000000006faaaa';

    fixtures({
      User: [NON_ADMIN_VALID_USER]
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .del('/api/v1/product/' + subscriptionToRemove + '/subscribe')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_X_USER_ID)
        .expect(200)
        .end(function(err) {

          expect(err).to.be(null);

          done();
        });
    });
  });

  it('Get User: Valid User', function(done) {

    fixtures({
      User: [NON_ADMIN_VALID_USER]
    }, function(err, data) {

      expect(err).to.be(null);

      let user = data[0][0];

      request(app)
        .get('/api/v1/user')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', user._id)
        .expect(200)
        .end(function(err, res) {

          expect(err).to.be(null);
          expect(res.body.name).to.be.eql(user.name);
          expect(res.body.email).to.be.eql(user.email);
          expect(res.body.client).to.be.eql(user.client);

          done();
        });
    });
  });

  it('Get User: non-existing User', function(done) {

    fixtures({
      User: [NON_ADMIN_VALID_USER]
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/api/v1/user')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_EXISTING_USER)
        .expect(404)
        .end(function(error, result) {
          expect(error).to.be(null);
          expect(result.body).to.have.property('message');
          expect(result.body.message).to.equal('Could not find requested user');
          expect(result.body).to.have.property('code');
          expect(result.body.code).to.equal('NotFoundError');
          done();
        });
    });
  });

  it('Verify New User: Non-Superadmin Domain', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/validDomainNewUser');

    request(app)
      .post('/api/v1/user/verify')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(userEmail)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body.canRegister).to.be.equal(true);
        return done();
      });
  });

  it('Verify New User: Superadmin Domain', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/superadminDomainNewUser');

    request(app)
      .post('/api/v1/user/verify')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(userEmail)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body.canRegister).to.be.equal(true);
        return done();
      });
  });

  it('Verify New User: Invalid Domain', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/invalidDomainNewUser');

    request(app)
      .post('/api/v1/user/verify')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(userEmail)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body.canRegister).to.be.equal(false);
        return done();
      });
  });

  it('Verify New User: Badly-formatted Email', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/badlyFormattedEmail');

    request(app)
      .post('/api/v1/user/verify')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(userEmail)
      .expect(422)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.have.property('code');
        expect(res.body.code).to.equal('UnprocessableEntityError');
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal('Email not valid');
        return done();
      });
  });

  it('Verify New User: Existing Email', function(done) {

    let userEmail = {
      email: NON_ADMIN_VALID_USER.email
    };

    fixtures({
      User: [NON_ADMIN_VALID_USER]
    }, function(err) {
      expect(err).to.be(null);

      request(app)
        .post('/api/v1/user/verify')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(userEmail)
        .expect(409)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.have.property('code');
          expect(res.body.code).to.equal('ConflictError');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('Email already in use');
          return done();
        });
    });
  });

  it('Verify New User: Invalid Domain', function(done) {

    let userEmail = require(process.cwd() + '/test/fixtures/user/invalidDomainNewUser');

    request(app)
      .post('/api/v1/user/verify')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(userEmail)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body.canRegister).to.be.equal(false);
        return done();
      });
  });

  it('Get Users list: non-admin valid user', function(done) {

    let pagesize = 10;
    let offset = 0;

    request(app)
      .get('/api/v1/user/list?pagesize=' + pagesize + '&offset=' + offset)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);

        let users = res.body;
        expect(users).not.to.be.empty();
        expect(users).to.have.length(USER_FIXTURES.length);

        return done();
      });
  });

  it('Get Users list: non-admin valid user and small pageSize', function(done) {

    let pagesize = 2;
    let offset = 0;

    request(app)
      .get('/api/v1/user/list?pagesize=' + pagesize + '&offset=' + offset)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);

        let users = res.body;
        expect(users).not.to.be.empty();
        expect(users).to.have.length(pagesize);

        return done();
      });
  });

  it('Get Users list: non-admin valid user and non-zero offset', function(done) {

    let pagesize = 10;
    let offset = 2;

    request(app)
      .get('/api/v1/user/list?pagesize=' + pagesize + '&offset=' + offset)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);

        let users = res.body;
        expect(users).not.to.be.empty();
        expect(users).to.have.length(USER_FIXTURES.length - offset);

        return done();
      });
  });

  it('Get Users list: admin valid user', function(done) {

    let pagesize = 10;
    let offset = 0;

    request(app)
      .get('/api/v1/user/list?pagesize=' + pagesize + '&offset=' + offset)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);

        let users = res.body;
        expect(users).not.to.be.empty();
        expect(users).to.have.length(USER_FIXTURES.length);

        return done();
      });
  });

  it('Get Users list: admin valid user and small pageSize', function(done) {

    let pagesize = 2;
    let offset = 0;

    request(app)
      .get('/api/v1/user/list?pagesize=' + pagesize + '&offset=' + offset)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);

        let users = res.body;
        expect(users).not.to.be.empty();
        expect(users).to.have.length(pagesize);

        return done();
      });
  });

  it('Get Users list: admin valid user and non-zero offset', function(done) {

    let pagesize = 10;
    let offset = 2;

    request(app)
      .get('/api/v1/user/list?pagesize=' + pagesize + '&offset=' + offset)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);

        let users = res.body;
        expect(users).not.to.be.empty();
        expect(users).to.have.length(USER_FIXTURES.length - offset);

        return done();
      });
  });
});
