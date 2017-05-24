'use strict';

const request = require('request');

module.exports = function () {

	this.When(/^I request creation of new feature with following data$/, (table, done) => {
		const world = this.world;
		world.features = world.features || [];

		const featureData = table.hashes()[0];
		const featureToCreate = {
			name: featureData.name,
			blueprintId: featureData.blueprint,
			context: featureData.context,
			goal: featureData.goal
		};
		if (featureData.hasOwnProperty('tags')) featureToCreate.tags = featureData.tags.split(',');
		world.features.push(featureToCreate);

		const options = {
			url: world.host + '/api/feature',
			headers: {
				'x-transaction-id': 'tests',
				'x-profile-id': featureData.requester,
				'x-debug': true
			},
			method: 'POST',
			json: true,
			body: featureToCreate
		};
		request(options, (err, res)=> {
			world.lastResponse = {
				statusCode: res.statusCode,
				body: res.body
			};
			if (err) {
				world.lastResponse.body = err;
			}
			if (res.body.id) {
				featureToCreate.id = res.body.id;
			}
			done();
		});

	});
};
