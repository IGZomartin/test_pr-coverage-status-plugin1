'use strict';

const request = require('request-promise');

module.exports = function () {

	this.Given(/^the following blueprints are already created$/, (table, done) => {
		const world = this.world;

		const blueprintRequests = table.hashes().map(blueprint=> {
			const blueprintToCreate = {
				name: blueprint.name,
				projectId: blueprint.project
			};

			const options = {
				url: world.host + '/api/blueprint',
				headers: {
					'x-transaction-id': 'tests',
					'x-profile-id': blueprint.requester,
					'x-debug': true
				},
				method: 'POST',
				json: true,
				body: blueprintToCreate
			};
			return request(options);
		});

		Promise
			.all(blueprintRequests)
			.then((ids)=> {
				world.blueprints = ids;
				done();
			})
			.catch(err=> {
				done(new Error(err));
			});
	});
};
