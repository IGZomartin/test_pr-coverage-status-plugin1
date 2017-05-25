'use strict';

let samples = require('./../util/file_loader');

function list() {
  let examples = {};

  examples['application/json'] = samples.loadResourceItem('Platform');

  if (Object.keys(examples).length > 0) {
    return examples[Object.keys(examples)[0]];
  }
}

module.exports = { list };
