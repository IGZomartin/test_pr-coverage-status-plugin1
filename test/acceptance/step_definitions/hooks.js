'use strict';

const httpServices = require('../../../src/http_services');
const dbConn = require('../../../src/database/connection');

const cleanDB = () => dbConn().then(db => db.dropDatabase());

module.exports = function () {

	this.Before(() => {
		this.world = {
			host : 'http://localhost:3002'
		};
		return httpServices
			.start(3002)
			.then(cleanDB);
	});

	this.After(cleanDB);
};
