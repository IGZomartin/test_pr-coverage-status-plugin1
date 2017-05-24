'use strict';

const request = require('request');

module.exports = function () {

	this.When(/^I request to find all projects of profile "([^"]*)"$/, (profileId, done) => {
		const world = this.world;

		const options = {
			url: world.host + '/api/projects',
			headers: {
				'x-transaction-id': 'tests',
				'x-debug': true
			},
			method: 'GET',
			json: true,
			qs: {q: {profileId}}
		};
		request(options, (err, res)=> {
			world.lastResponse = {
				statusCode: res.statusCode,
				body: res.body
			};
			if(err){
				world.lastResponse.body = err;
			}
			done();
		});

	});
};
