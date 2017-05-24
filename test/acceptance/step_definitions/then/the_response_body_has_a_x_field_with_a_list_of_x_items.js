"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body has a "([^"]*)" field with a list of (\d+) items/, (fieldName, items, done) => {
		const world = this.world;

		console.log('world.lastResponse ->', world.lastResponse);
		assert.ok(world.lastResponse.body.hasOwnProperty(fieldName));
		assert.ok(world.lastResponse.body[fieldName].length === Number(items));

		done();
	});
};
