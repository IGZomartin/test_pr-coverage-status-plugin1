'use strict';

const storageConnection = require('../database/connection.js');

module.exports = (featureId, updateData) => {
	return new Promise((ok, ko) => {
		storageConnection()
			.then(db => {
				return db.collection('features').updateOne({id: featureId}, updateData);
			})
			.then(() => {
				ok();
			})
			.catch(err => ko(err));

	});
};
