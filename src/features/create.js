'use strict';

const storageConnection = require('../database/connection.js');
const errors = require('../errors');
const find = require('./find');
const logger = require('../logger');
const escapeStringRegexp = require('escape-string-regexp');

module.exports = (feature, req) => {
	return new Promise((ok, ko) => {
		logger.info(`creating feature ${JSON.stringify(feature)}`, req);

		const uniqueNameFilter = {
			name: new RegExp(`^${escapeStringRegexp(feature.name)}$`, 'i'),
			blueprintId: feature.blueprintId
		};

		find(uniqueNameFilter)
			.then(features => {
				if (features.length > 0) {
					return ko(errors.FEATURE_ALREADY_EXIST);
				}
				return storageConnection();
			})
			.then(db => db.collection('features').insertOne(feature))
			.then(() => ok(feature.id))
			.catch(err => ko(err));
	});
};
