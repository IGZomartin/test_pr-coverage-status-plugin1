'use strict';

const retrieve = require('./retrieve.js');

module.exports = (req, res, next) => {

	retrieve(req.params.featureId)
		.then(doc => {
			res.send(doc ? 200 : 404, doc);
			next();
		})
		.catch(err => {
			res.send(500, err);
			next();
		});

};
