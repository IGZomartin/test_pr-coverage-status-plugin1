'use strict';

const AWSManager = require('./aws');
const _ = require('lodash');
const config = require('config');

module.exports = {
  create,
  getProviderConfig
};

function create(config) {
  if (!config || !_.isObject(config)) {
    throw new Error('Missing manager config');
  }
  switch (config.provider) {

    case 'aws':
      return new AWSManager(config);

    default:
      throw new Error('Unknwon provider');
  }
}

function getProviderConfig() {
  const provider = config.get('cloud.provider');

  if (!config.has(provider)) return false;

  return {
    provider: provider,
    credentials: config.get(provider + '.credentials'),
    bucket: config.get(provider + '.bucket')
  };
}
