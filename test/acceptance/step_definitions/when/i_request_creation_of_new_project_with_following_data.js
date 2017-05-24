'use strict';

const request = require('request');

module.exports = function () {

	this.When(/^I request creation of new project with following data$/, (table, done) => {
		const world = this.world;

		const projectData = table.hashes()[0];
		const projectToCreate = {
			name: projectData.name,
			avatar: projectData.avatar,
			isPublic: projectData.public
		};

		if(projectData.organization ) {
			projectToCreate.organizationId = projectData.organization;
		}

		const options = {
			url: world.host + '/api/project',
			headers: {
				'x-transaction-id': 'tests',
				'x-profile-id': projectData.requester,
				'x-debug': true
			},
			method: 'POST',
			json: true,
			body: projectToCreate
		};
		request(options,(err,res)=>{
			world.lastResponse = {
				statusCode: res.statusCode,
				body: res.body
			};
			if(err) {
				world.lastResponse.body = err;
			}
			done();
		});

	});
};
