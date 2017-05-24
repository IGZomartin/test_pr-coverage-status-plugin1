'use strict';

const storageConnection = require('../database/connection.js');

module.exports = query => {
	return storageConnection()
		.then(db => db.collection('features').find(query, {_id: 0}))
		.then(cursor => {
			return Promise.resolve(cursor.toArray());
		})
		.catch(err => {
			return Promise.reject(err);
		});

};
