"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body has a "([^"]*)" field$/, (fieldName, done) => {
		const world = this.world;

		assert.ok(world.lastResponse.body.hasOwnProperty(fieldName));

		done();
	});
};
