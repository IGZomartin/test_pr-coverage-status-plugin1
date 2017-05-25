'use strict';

const expect = require('expect.js');
const request = require('supertest');
const fixtures = require('node-mongoose-fixtures');
const resetDB = require('../../../lib/util/reset_db');
const app = require('../../../bin/server');
const _ = require('lodash');

const USER_FIXTURES = require(process.cwd() + '/test/fixtures/user/userList');
const CLIENT_FIXTURES = require(process.cwd() + '/test/fixtures/client/Client');
const INVALID_CLIENT = require(process.cwd() + '/test/fixtures/client/invalidClient');
const VALID_CLIENT = require(process.cwd() + '/test/fixtures/client/validClient');
const INVALID_CLIENT_ID = '01f0000000000000013f0020';
const NON_ADMIN_VALID_X_USER_ID = '01f0000000000000003f0001';
const SUPERADMIN_X_USER_ID = '01f0000000000000003f0004';

describe('Client Router', function() {

  beforeEach(function(done) {
    resetDB.initDb(function() {
      fixtures({
        User: USER_FIXTURES
      }, done);
    });
  });

  afterEach(resetDB.dropDb);

  it('Create Client: Valid JSON', function(done) {

    request(app)
      .post('/api/v1/client')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send(VALID_CLIENT)
      .expect(200)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('name');
        expect(res.body).to.have.property('domains');
        expect(res.body).to.have.property('envs');

        return done();
      });
  });

  it('Create Client: Invalid JSON', function(done) {

    request(app)
      .post('/api/v1/client')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', SUPERADMIN_X_USER_ID)
      .send(INVALID_CLIENT)
      .expect(500)
      .end(function(err, res) {

        expect(err).to.be(null);
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.be.eql('Client validation failed');

        return done();
      });
  });

  it('Create Client: Duplicate Client', function(done) {

    let client = {
      name: CLIENT_FIXTURES[0].name
    };

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .post('/api/v1/client')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send(client)
        .expect(500)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body.code).to.equal('InternalError');
          return done();
        });
    });
  });

  it('Get Client: Valid Client', function(done) {

    let client = _.clone(CLIENT_FIXTURES[0]);

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/api/v1/client/' + client.name)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body.name).to.be.eql(client.name);
          expect(res.body.domains).to.be.eql(client.domains);
          expect(res.body.envs).to.be.eql(client.envs);
          return done();
        });
    });
  });

  it('Get Client: Invalid Client', function(done) {
    let clientName = 'Randomness';

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .get('/api/v1/client/' + clientName)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.be.empty();
          return done();
        });
    });
  });

  it('Update Client: Valid Client', function(done) {
    let client = _.clone(CLIENT_FIXTURES[0]);

    client.domains = [];

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .put('/api/v1/client/' + client._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send(client)
        .expect(204)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.be.empty();

          request(app)
            .get('/api/v1/client/' + client.name)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(200)
            .end(function(err, res) {
              expect(err).to.be(null);
              expect(res.body.name).to.be.eql(client.name);
              expect(res.body.domains).to.be.eql(client.domains);
              expect(res.body.envs).to.be.eql(client.envs);
              return done();
            });
        });
    });
  });

  it('Update Client: Invalid Client', function(done) {
    let client = _.clone(CLIENT_FIXTURES[0]);
    client._id = '01f0000000000000013f0020';
    client.domains = [];

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);

      request(app)
        .put('/api/v1/client/' + client._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', SUPERADMIN_X_USER_ID)
        .send(client)
        .expect(404)
        .end(function(err, res) {
          expect(res.body.code).to.equal('NotFoundError');
          expect(res.body.message).to.equal('Could not find requested Client object');
          expect(err).to.equal(null);
          return done();
        });
    });
  });


  it('Delete Client: Valid Client', function(done) {

    let client = _.clone(CLIENT_FIXTURES[0]);

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      request(app)
        .del('/api/v1/client/' + client._id)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(204)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.be.empty();

          request(app)
            .get('/api/v1/client/' + client.name)
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', SUPERADMIN_X_USER_ID)
            .expect(200)
            .end(function(err, res) {
              expect(err).to.be(null);
              expect(res.body).to.be.empty();

              request(app)
                .get('/api/v1/client/list')
                .set('Content-Type', 'application/json; charset=utf-8')
                .set('x-user-id', SUPERADMIN_X_USER_ID)
                .expect(200)
                .end(function(err, res) {
                  expect(err).to.equal(null);
                  expect(res.body).to.not.be.empty();
                  expect(res.body).to.have.length(CLIENT_FIXTURES.length - 1);
                  return done();
                });
            });
        });
    });
  });

  it('Delete Client: Invalid Client', function(done) {

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      request(app)
        .del('/api/v1/client/' + INVALID_CLIENT_ID)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(404)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body).to.have.property('code');
          expect(res.body).to.have.property('message');
          expect(res.body.code).to.equal('NotFoundError');
          expect(res.body.message).to.equal('Could not find requested Client object');

          request(app)
            .get('/api/v1/client/list')
            .set('Content-Type', 'application/json; charset=utf-8')
            .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
            .expect(200)
            .end(function(err, res) {
              expect(err).to.be(null);
              expect(res.body).to.not.be.empty();
              expect(res.body).to.have.length(CLIENT_FIXTURES.length);
              return done();
            });
        });
    });
  });

  it('List Client: Existing Client', function(done) {

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      request(app)
        .get('/api/v1/client/list')
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
        .expect(200)
        .end(function(err, res) {
          expect(err).to.be(null);
          expect(res.body.length).to.equal(CLIENT_FIXTURES.length);
          return done();
        });
    });
  });

  it('List Client: Empty Client collection', function(done) {

    request(app)
      .get('/api/v1/client/list')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('x-user-id', NON_ADMIN_VALID_X_USER_ID)
      .expect(200)
      .end(function(err, res) {
        expect(err).to.be(null);
        expect(res.body).to.be.empty();
        return done();
      });
  });
});
