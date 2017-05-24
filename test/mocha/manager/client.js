'use strict';

const expect = require('expect.js');
const fixtures = require('node-mongoose-fixtures');
const clientManager = require('../../../lib/managers/Client');
const resetDB = require('../../../lib/util/reset_db');
const _ = require('lodash');

const CLIENT_FIXTURES = require(process.cwd() + '/test/fixtures/client/Client');
const INVALID_CLIENT = require(process.cwd() + '/test/fixtures/client/invalidClient');
const VALID_CLIENT = require(process.cwd() + '/test/fixtures/client/validClient');
const INVALID_CLIENT_ID = '01f0000000000000013f0020';
const NON_EXISTING_CLIENT_NAME = 'Randomness';

describe('Client Manager', function() {

  beforeEach(resetDB.initDb);
  afterEach(resetDB.dropDb);

  it('Create Client: Valid JSON', function(done) {

    clientManager.create(VALID_CLIENT, function(err, result) {

      expect(err).to.be(null);
      expect(result).to.have.property('id');
      return done();
    });
  });

  it('Create Client: Invalid JSON', function(done) {

    clientManager.create(INVALID_CLIENT, function(err) {
      expect(err).not.to.be(null);
      return done();
    });
  });

  it('Create Client: Duplicated Client', function(done) {
    let client = {
      name: CLIENT_FIXTURES[0].name
    };

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      clientManager.create(client, function(error, res) {
        expect(error).not.to.be(null);
        expect(res).to.be(undefined);
        return done();
      });
    });
  });

  it('Get Client: Existing Client', function(done) {

    let client = CLIENT_FIXTURES[0];

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      clientManager.get(client.name, function(error, foundClient) {
        expect(error).to.be(null);
        expect(foundClient.id).to.equal(client._id);
        expect(foundClient).to.have.property('name');
        expect(foundClient).to.have.property('domains');
        expect(foundClient).to.have.property('envs');
        expect(foundClient.domains).to.have.length(client.domains.length);
        expect(foundClient.envs).to.have.length(client.envs.length);
        return done();
      });
    });
  });

  it('Get Client: Non-existing Client', function(done) {

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      clientManager.get(NON_EXISTING_CLIENT_NAME, function(error, result) {
        expect(error).to.be(null);
        expect(result).to.be.empty();
        return done();
      });
    });
  });

  it('List Client: Existing Client', function(done) {

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {

      expect(err).to.be(null);
      clientManager.list({}, function(error, clientList) {
        expect(error).to.be(null);
        expect(clientList).to.have.length(CLIENT_FIXTURES.length);
        return done();
      });
    });
  });

  it('List Client: Empty Client List', function(done) {
    clientManager.list({}, function(error, clientList) {
      expect(error).to.be(null);
      expect(clientList).to.be.empty();
      return done();
    });
  });

  it('Update Client: Existing Client', function(done) {
    let client = _.clone(CLIENT_FIXTURES[0]);

    client.domains = [];

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {
      expect(err).to.be(null);

      clientManager.update(client._id, client, function(error, result) {
        expect(error).to.be(null);
        expect(result).to.be(undefined);
        return done();
      });
    });
  });

  it('Update Client: Non-existing Client', function(done) {
    let data = {
      name: 'Invent Co.'
    };

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {
      expect(err).to.be(null);

      clientManager.update(INVALID_CLIENT_ID, data, function(error, result) {
        expect(error).to.not.be(null);
        expect(error).to.have.property('message');
        expect(error.message).to.equal('Could not find requested Client object');
        expect(error).to.have.property('body');
        expect(error.body.code).to.equal('NotFoundError');
        expect(error.body.message).to.equal('Could not find requested Client object');
        expect(result).to.be(undefined);
        return done();
      });
    });
  });

  it('Delete Client: Existing Client', function(done) {
    let clientToDelete = CLIENT_FIXTURES[0];

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {
      expect(err).to.be(null);

      clientManager.delete(clientToDelete._id, function(err, result) {
        expect(err).to.be(null);
        expect(result).to.be(undefined);

        clientManager.get(clientToDelete.name, function(error, foundClient) {
          expect(error).to.be(null);
          expect(foundClient).to.be.empty();
          return done();
        });
      });
    });
  });

  it('Delete Client: Non-existing Client', function(done) {

    fixtures({
      Client: CLIENT_FIXTURES
    }, function(err) {
      expect(err).to.be(null);

      clientManager.delete(INVALID_CLIENT_ID, function(err, result) {
        expect(err).to.have.property('message');
        expect(err.message).to.equal('Could not find requested Client object');
        expect(err).to.have.property('body');
        expect(err.body).to.have.property('code');
        expect(err.body.code).to.equal('NotFoundError');
        expect(err.body).to.have.property('message');
        expect(err.body.message).to.equal('Could not find requested Client object');
        expect(result).to.be(undefined);
        return done();
      });
    });
  });
});
