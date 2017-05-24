'use strict';

const request = require('request');

module.exports = function () {

	this.When(/^I request to delete the feature "([^"]*)"$/, (featureTitle, done) => {
		const world = this.world;
		world.features = world.features || [];

		const feature = world.features.find(feature => feature.name === featureTitle);
		const featureId = feature ? feature.id : 'invalid';

		const options = {
			url: world.host + '/api/feature/' + featureId,
			headers: {
				'x-transaction-id': 'tests',
				'x-debug': true
			},
			method: 'DELETE',
			json: true
		};
		request(options, (err, res)=> {
			world.lastResponse = {
				statusCode: res.statusCode,
				body: res.body
			};
			if (err) {
				world.lastResponse.body = err;
			}
			done();
		})

	});
};
