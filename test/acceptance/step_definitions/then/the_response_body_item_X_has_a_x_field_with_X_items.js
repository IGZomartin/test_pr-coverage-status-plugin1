"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body item (\d+) has a "([^"]*)" field$/, (itemIndex, fieldName, done) => {
		const world = this.world;

		assert.ok(world.lastResponse.body.hasOwnProperty("items"));
		assert.ok(world.lastResponse.body.items[Number(itemIndex)].hasOwnProperty(fieldName));

		done();
	});
};
