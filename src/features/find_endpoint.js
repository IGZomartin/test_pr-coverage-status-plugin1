'use strict';

const find = require('./find');

module.exports = (req, res, next) => {
	const q = req.query.q;

	if (q.blueprintId) {
		find({blueprintId: q.blueprintId})
			.then(features => {
				res.send(200, {items: features});
				return next();
			})
			.catch(err => {
				res.send(500, err);
				return next();
			});
	} else {
		res.send(400, {error: 'no query parameters found'});
		return next();
	}
};
