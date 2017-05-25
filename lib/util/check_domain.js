'use strict';

const _ = require('lodash');
const config = require('config');

function getDomain(email) {
  return email.split('@')[1];
}

function isValidDomain(emailToCheck, domains) {
  let domainToCheck = getDomain(emailToCheck);

  let superadmin = isSuperadmin(emailToCheck);
  let nonadmin = _.contains(domains, domainToCheck);

  return (nonadmin || superadmin);
}

function isSuperadmin(emailToCheck) {
  let domainToCheck = getDomain(emailToCheck);

  return _.contains(config.get('auth.superadminDomains'), domainToCheck);
}

module.exports = { isValidDomain, isSuperadmin, getDomain };
