'use strict';

const mongoose = require('mongoose');
let ClientSchema, model;

ClientSchema = new mongoose.Schema({
  name: {type: String, trim: true, unique: true, required: true},
  envs: [{type: String, trim: true}],
  domains: [{type: String, trim: true}],
  whitelist: [{type: String, trim: true}],
  ts: {type: Date, default: Date.now, required: true}
});


ClientSchema.virtual('id').get(function() {
  return this._id;
});

model = mongoose.model('Client', ClientSchema);

module.exports = model;
