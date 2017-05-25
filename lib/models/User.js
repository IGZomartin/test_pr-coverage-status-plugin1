'use strict';

const mongoose = require('mongoose');
const config = require('config');
const domainChecker = require(process.cwd() + '/lib/util/check_domain');
let UserSchema, model;

UserSchema = new mongoose.Schema({
  ts: {type: Date, default: Date.now},
  name: {type: String, trim: true, required: true},
  email: {
    type: String, trim: true,
    match: [new RegExp(config.get('validations.email'), 'i'), 'Email not valid'],
    unique: true
  },
  client: {type: String, trim: true, required: true},
  igzuser: {type: Boolean, default: false},
  userDomains: {type: Boolean}
});

UserSchema.pre('save', function(next) {

  let emailToCheck = this.email;
  this.igzuser = domainChecker.isSuperadmin(emailToCheck);

  return next();
});

UserSchema.virtual('id').get(function() {
  return this._id;
});

model = mongoose.model('User', UserSchema);

module.exports = model;
