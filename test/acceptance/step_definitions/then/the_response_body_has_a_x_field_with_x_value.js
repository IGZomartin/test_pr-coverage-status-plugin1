"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body has a "([^"]*)" field with a "([^"]*)" value$/, (fieldName, fieldValue, done) => {
		const world = this.world;

		assert.equal(world.lastResponse.body[fieldName] === undefined, false);
		assert.equal(world.lastResponse.body[fieldName] === fieldValue, true);

		done();
	});
};
