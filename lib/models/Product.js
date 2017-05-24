'use strict';

const mongoose = require('mongoose');
const urlConstructor = require('../util/url_constructor');
let ProductSchema, model;

let compilation = {
  compilationId: {type: mongoose.Schema.Types.ObjectId, required: true},
  version: {type: String, trim: true, required: true},
  platform: {type: String, trim: true, required: true},
  platformVersion: {type: String, trim: true, required: true},
  public: {type: Boolean, default: false, required: true},
  environment: {type: String, trim: true, required: true},
  permission: {type: String, trim: true, required: true, default: false},
  uploaded_at: {type: Date, default: Date.now, required: true},
  uploaded: {type: Boolean, default: false, required: true},
  filePath: {type: String, trim: true, required: true},
  filename: {type: String, trim: true, required: false, default: ''},
  downloadUrl: {type: String, trim: true, required: false, default: ''},
  bundleId: { type: String, trim: true, required: false, default: ''}
};

let subscription = { type: String, trim: true};

ProductSchema = new mongoose.Schema({
  name: {type: String, trim: true, required: true, unique: true},
  description: {type: String, trim: true, required: true},
  client: {type: String, trim: true, required: true},
  created_at: {type: Date, default: Date.now},
  icon: {type: Buffer, required: false},
  public: {type: Boolean, default: false, required: true},
  compilations: [compilation],
  subscriptions: [subscription]
}, {versionKey: false, toObject: {virtuals: true}, toJSON: {virtuals: true}});

ProductSchema.virtual('id').get(function() {
  return this._id;
});

ProductSchema.virtual('iconUrl').get(function() {
  return urlConstructor.getProductImageRelativeUrl(this);
});

model = mongoose.model('Product', ProductSchema);

module.exports = model;
