'use strict';

const request = require('request');

module.exports = function () {

	this.When(/^I request to edit the feature "([^"]*)" to the new data$/, (featureName, table, done) => {
		const world = this.world;
		world.features = world.features || [];

		const feature = world.features.find(feature => feature.name === featureName);
		const featureId = feature ? feature.id : 'invalid';

		const newData = table.hashes()[0];
		const updateData = {
			name: newData.name,
			context: newData.context,
			goal: newData.goal
		};
		if (newData.hasOwnProperty('testsResult')) updateData.testsResult = newData.testsResult;
		if (newData.hasOwnProperty('tags')) updateData.tags = newData.tags.split(',');

		const options = {
			url: world.host + '/api/feature/' + featureId,
			headers: {
				'x-transaction-id': 'tests',
				'x-debug': true
			},
			method: 'PUT',
			json: true,
			body: updateData
		};
		request(options, (err, res)=> {
			world.lastResponse = {
				statusCode: res.statusCode,
				body: res.body
			};
			if (err) {
				world.lastResponse.body = err;
			}
			if (feature) Object.assign(feature, updateData);
			done();
		})

	});
};
