'use strict';

const expect = require('expect.js');
const nock = require('nock');
const resonatorConfig = require('config').externalServices.resonator;
const notificationManager = require('../../../lib/managers/Notification');
const VALID_USER_ID = '01f0000000000000003f0001';
const DOWNLOAD_URL = 'http://igzdownloader.local/api/v1/product/5638ed3a4128785f38af5dc0/compilation/5638ed564128785f38af5dc1/download';


describe('Notification Manager', function() {

  it('Identity: Resonator Works', function(done) {
    let user = { _id: VALID_USER_ID };
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.createIdentity.path)
      .reply(201, {
        'id': user._id
      });

    notificationManager.sendIdentityToResonator(user, function(err) {
      expect(err).to.be();

      done();
    });

  });

  it('Identity: Resonator Doesn\'t Works', function(done) {
    let user = { _id: VALID_USER_ID };
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.createIdentity.path)
      .replyWithError(500);

    notificationManager.sendIdentityToResonator(user, function(err) {
      expect(err).to.not.be();

      done();
    });

  });

  it('Send Ack Compilation Emails: Resonator Works', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.email.path)
      .reply(204);

    let user = {_id: VALID_USER_ID};
    let downloadUrl = DOWNLOAD_URL;

    notificationManager.sendAckCompilationEmails(user, downloadUrl, function(err) {
      expect(err).to.be();

      done();
    });

  });


  it('Send Ack Compilation Emails: Resonator Doesn\'t Works', function(done) {
    nock(resonatorConfig.host)
      .post(resonatorConfig.services.email.path)
      .replyWithError(400);

    let identities = [VALID_USER_ID];
    let downloadUrl = DOWNLOAD_URL;

    notificationManager.sendAckCompilationEmails(identities, downloadUrl, function(err) {
      expect(err).to.not.be();

      done();
    });

  });
});
