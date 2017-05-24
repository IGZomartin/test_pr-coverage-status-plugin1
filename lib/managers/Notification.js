'use strict';

const _ = require('lodash');
const request = require('request');
const config = require('config');
const notificationTemplates = require('../../templates/notification.json');
const urlConstructor = require('../util/url_constructor');

function sendAckCompilationEmails(identities, product, compilation, callback) {
  let ackCompilationTemplate = _.clone(notificationTemplates.ack_compilation);
  let httpHost = urlConstructor.switchToHttp(config.get('host'));
  let compilationImageUrl = urlConstructor.getDownloadCompilationUrl(product, compilation);

  ackCompilationTemplate.subject = ackCompilationTemplate.subject.replace('{productName}', product.name);
  ackCompilationTemplate.message = ackCompilationTemplate.message
    .replace(new RegExp('{productName}', 'g'), product.name)
    .replace('{productImageUrl}', httpHost + '/images/' + product._id.toString() + '.png')
    .replace('{productDownloadUrl}', compilationImageUrl)
    .replace('{compilationVersion}', compilation.version);

  let options = {
    method: 'POST',
    url: config.get('externalServices.resonator.host') + config.get('externalServices.resonator.services.email.path'),
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
    url: config.get('externalServices.resonator.host') + config.get('externalServices.resonator.services.createIdentity.path'),
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

