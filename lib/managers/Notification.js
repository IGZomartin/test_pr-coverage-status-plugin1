'use strict';

const _ = require('lodash');
const request = require('request');
const resonatorConfig = require('config').externalServices.resonator;
const notificationTemplates = require('../../templates/notification.json');

function sendAckCompilationEmails(identities, downloadURL, callback) {
  let ackCompilationTemplate = _.clone(notificationTemplates.ack_compilation);
  ackCompilationTemplate.message = ackCompilationTemplate.message + '<a href=' + downloadURL + '>Pulse este enlace para descargarla</a>';

  let options = {
    method: 'POST',
    url: resonatorConfig.host + resonatorConfig.services.email.path,
    json: true,
    body: {
      'identities': identities,
      'channels': [],
      'content': ackCompilationTemplate
    }
  };

  if (_.isEmpty(identities)) {
    return callback();
  }

  request.post(options, function(error) {

    if (error) return callback(error);

    return callback();
  });

}

function sendIdentityToResonator(user, callback) {
  let options = {
    method: 'POST',
    url: resonatorConfig.host + resonatorConfig.services.createIdentity.path,
    json: true,
    body: {
      _id: user._id.toString(),
      channels: [],
      devices: {
        email: [user.email]
      }
    }
  };

  request(options, function(error) {
    if (error) return callback(error);

    return callback();
  });
}

module.exports = {
  sendAckCompilationEmails,
  sendIdentityToResonator
};

