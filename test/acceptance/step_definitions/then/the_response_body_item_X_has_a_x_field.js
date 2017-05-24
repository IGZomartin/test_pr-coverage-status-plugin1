"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body item (\d+) has a "([^"]*)" field with (\d+) items?$/, (itemIndex, fieldName, itemCount, done) => {
		const world = this.world;

		assert.ok(world.lastResponse.body.hasOwnProperty("items"));
		assert.ok(world.lastResponse.body.items[Number(itemIndex)].hasOwnProperty(fieldName));
		assert.ok(world.lastResponse.body.items[Number(itemIndex)][fieldName].length === Number(itemCount));

		done();
	});
};
