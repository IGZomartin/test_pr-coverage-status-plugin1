'use strict';

const storageConnection = require('../database/connection.js');

module.exports = featureId => {
	return new Promise((resolve, reject) => {
		storageConnection()
			.then(db => db.collection('features').find({id: featureId}, {_id: 0}).limit(1))
			.then(cursor => {
				cursor.next((err, doc) => {
					if (err) return reject(err);
					resolve(doc);
				});
			})
			.catch(err => reject(err));
	});
};
