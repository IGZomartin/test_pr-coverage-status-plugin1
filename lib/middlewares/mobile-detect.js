'use strict';

const MobileDetect = require('mobile-detect');

module.exports = function() {

  return function mobileDetect(req, res, next) {

    req.device = new MobileDetect(req.headers['user-agent']);

    return next();
  };

};
