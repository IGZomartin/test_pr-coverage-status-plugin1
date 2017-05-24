'use strict';

const platformManager = require('./../managers/Platform');

function listPlatforms(req, res) {
  let result = platformManager.list();
  res.send(result);
}

module.exports = {listPlatforms};
