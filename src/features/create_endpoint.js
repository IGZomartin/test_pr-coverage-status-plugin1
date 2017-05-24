'use strict';

const create = require('./create.js');
const errors = require('../errors');
const logger = require('../logger');
const shortid = require('shortid');

//const nameValidCharacters = /^[a-zA-Z0-9\s-_,.;:?!()]+$/;

module.exports = (req, res, next) => {
	logger.info(`attempt to create a feature with params ${JSON.stringify(req.params)}`, req);

	if (!req.params.name) {
		logger.warn('attempt to create an feature without name', req);
		res.send(400, errors.FEATURE_REQUIRE_NAME);
		return next();
	}

	if (!req.params.blueprintId) {
		logger.warn('attempt to create an feature without a blueprint', req);
		res.send(400, errors.FEATURE_REQUIRE_BLUEPRINT);
		return next();
	}

	/*
	if (!nameValidCharacters.test(req.params.name)) {
		logger.warn('invalid characters found on name', req);
		res.send(409, errors.FEATURE_INVALID_NAME_CHARACTERS);
		return next();
	}
*/

	if (req.params.tags) {
		if (!Array.isArray(req.params.tags)) {
			logger.warn('attempt to create a feature with invalid tags', req);
			res.send(400, errors.FEATURE_INVALID_TAGS);
			return next();
		}

		const tagsValidCharacters = /^[a-zA-Z0-9._\-]+$/;
		for (let idx in req.params.tags) {
			const tag = req.params.tags[idx];

			if (!tagsValidCharacters.test(tag)) {
				logger.warn('attempt to create a feature with invalid characters on tag', req);
				res.send(400, errors.FEATURE_INVALID_TAG_CHARACTERS);
				return next();
			}
		}
	}


	const feature = {
		id: `ft.${shortid.generate()}`,
		creationDate: new Date(),
		name: req.params.name.trim(),
		blueprintId: req.params.blueprintId
	};
	if (req.params.hasOwnProperty('context')) feature.context = req.params.context;
	if (req.params.hasOwnProperty('goal')) feature.goal = req.params.goal;
	if (req.params.hasOwnProperty('tags')) feature.tags = req.params.tags;

	create(feature, req)
		.then(blueprintId => {
			res.send(201, {id: blueprintId});
			return next();
		})
		.catch(err => {
			if (err === errors.FEATURE_ALREADY_EXIST) {
				res.send(409, err);
			} else {
				res.send(500, err);
			}
			return next();
		});
};
