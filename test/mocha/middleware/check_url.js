'use strict';

const expect = require('expect.js');
const checkUrl = require('../../../lib/middlewares/check_url');
const resetDB = require('../../../lib/util/reset_db');

const PUBLIC_URL = 'api/v1/product/01f0000000000000006f0001/subscribe';
const PRIVATE_URL = '/api/v1/client';

describe('Check URL Middleware', function() {

  beforeEach(resetDB.initDb);
  afterEach(resetDB.dropDb);

  it('Target public URL', function(done) {

    let request = {
      path: PUBLIC_URL,
      method: 'POST'
    };

    let response = {};

    checkUrl()(request, response, function(error) {
      expect(error).to.be(undefined);
      expect(request).to.have.property('isPublic');
      expect(request.isPublic).to.equal(true);
      return done();
    });
  });

  it('Target private URL', function(done) {
    let request = {
      path: PRIVATE_URL,
      method: 'POST'
    };

    let response = {};

    checkUrl()(request, response, function(error) {
      expect(error).to.be(undefined);
      expect(request).to.have.property('isPublic');
      expect(request.isPublic).to.equal(false);
      return done();
    });
  });
});
