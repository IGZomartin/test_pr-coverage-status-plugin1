'use strict';

const storageConnection = require('../database/connection.js');

module.exports = featureId => {
	return new Promise((ok, ko) => {
		storageConnection()
			.then(db => db.collection('features').findOneAndDelete({id: featureId}))
			.then(result => ok(result))
			.catch(err => ko(err));
	});
};
