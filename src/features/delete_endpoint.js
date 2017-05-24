'use strict';

const logger = require('../logger');
const del = require('./delete');
const retrieve = require('./retrieve');

module.exports = (req, res, next) => {
	logger.info(`attempt to delete a feature with params ${JSON.stringify(req.params)}`, req);

	const featureId = req.params.featureId;

	retrieve(featureId)
		.then(feature => {
			if (!feature) {
				res.send(404);
				return next();
			}

			return del(featureId);
		})
		.then(() => {
			res.send(204);
			return next();
		})
		.catch(err => {
			if (err) {
				logger.error(`error trying to delete the feature: ${err} ${JSON.stringify(err)}`, req);
				res.send(500, err);
			}
			return next();
		});
};
