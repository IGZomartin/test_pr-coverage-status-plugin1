'use strict';

const retrieve = require('./retrieve');
const errors = require('../errors');
const update = require('./update');
const logger = require('../logger');
const find = require('./find');
const escapeStringRegexp = require('escape-string-regexp');

//const nameValidCharacters = /^[a-zA-Z0-9\s-_,.;:?!()]+$/;

module.exports = (req, res, next) => {
	logger.info(`attempt to update a feature with params ${JSON.stringify(req.params)}`, req);
/*
	if (!nameValidCharacters.test(req.params.name)) {
		logger.warn('invalid characters found on name', req);
		res.send(409, errors.FEATURE_INVALID_NAME_CHARACTERS);
		return next();
	}
*/
	retrieve(req.params.featureId)
		.then(feature => {
			if (!feature) {
				res.send(404, errors.FEATURE_DOES_NOT_EXIST);
				return next();
			}

			if (req.params.hasOwnProperty('name')) {
				const uniqueNameFilter = {
					id: {$ne: feature.id},
					name: new RegExp(`^${escapeStringRegexp(req.params.name)}$`, 'i'),
					blueprintId: feature.blueprintId
				};
				return find(uniqueNameFilter);
			}
		})
		.then(sameNameFeatures => {
			if (sameNameFeatures && sameNameFeatures.length > 0) {
				res.send(409, errors.FEATURE_ALREADY_EXIST);
				return Promise.reject();
			}

			if (req.params.tags) {
				if (!Array.isArray(req.params.tags)) {
					logger.warn('attempt to create a feature with invalid tags', req);
					res.send(400, errors.FEATURE_INVALID_TAGS);
//					return next();
					return Promise.reject();
				}

				const tagsValidCharacters = /^[a-zA-Z0-9._\-]+$/;
				for (let idx in req.params.tags) {
					const tag = req.params.tags[idx];

					if (!tagsValidCharacters.test(tag)) {
						logger.warn('attempt to create a feature with invalid characters on tag', req);
						res.send(400, errors.FEATURE_INVALID_TAG_CHARACTERS);
//						return next();
						return Promise.reject();
					}
				}
			}

			const updateData = {
				$set: {}
			};
			if (req.params.hasOwnProperty('name')) updateData.$set.name = req.params.name.trim();
			if (req.params.hasOwnProperty('context')) updateData.$set.context = req.params.context;
			if (req.params.hasOwnProperty('goal')) updateData.$set.goal = req.params.goal;
			if (req.params.hasOwnProperty('testsResult')) updateData.$set.testsResult = req.params.testsResult;
			if (req.params.hasOwnProperty('tags')) updateData.$set.tags = req.params.tags;

			if (Object.keys(updateData.$set).length === 0) delete(updateData.$set);

			if (Object.keys(updateData).length > 0) {
				return update(req.params.featureId, updateData);
			}
			return Promise.resolve();
		})
		.then(() => {
			res.send(200);
			next();
		})
		.catch(err => {
			res.send(500, err);
			next();
		});

};
