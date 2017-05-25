'use strict';

const config = require('config');
const FILE_DIR = config.get('mock.path');

function loadJSONFile(filename) {
  return require(process.cwd() + FILE_DIR + filename);
}

function loadResourceItem(resourceType, itemId) {

  let resourceContent = loadJSONFile(resourceType);

  if (!resourceType) {
    return [];
  }

  if (itemId !== 0 && !itemId) {
    return resourceContent;
  }

  if (!resourceContent[itemId]) {
    return [];
  }

  return resourceContent[itemId];
}

module.exports = { loadResourceItem };
