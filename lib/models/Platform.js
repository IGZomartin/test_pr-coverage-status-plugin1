'use strict';

const mongoose = require('mongoose');
let PlatformSchema, model;

PlatformSchema = new mongoose.Schema({
  ts: {type: Date, default: Date.now, required: true},
  name: {type: String, trim: true, required: true, unique: true},
  platformVersions: [{type: String, trim: true}]
});

PlatformSchema.virtual('id').get(function() {
  return this._id;
});

model = mongoose.model('Platform', PlatformSchema);

module.exports = model;
