'use strict';

const mongoose = require('mongoose');

function getPublicToken() {
  return new mongoose.Types.ObjectId().toString();
}

module.exports = {
  getPublicToken
};
