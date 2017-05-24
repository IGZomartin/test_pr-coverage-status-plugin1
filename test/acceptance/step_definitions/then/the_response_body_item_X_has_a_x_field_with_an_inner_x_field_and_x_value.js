"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body item (\d+) has a "([^"]*)" field with an inner "([^"]*)" field and "([^"]*)" value$/, (itemIndex, fieldName, innerFieldName, innerFieldValue, done) => {
		const world = this.world;
		assert.ok(world.lastResponse.body.hasOwnProperty("items"));
		assert.ok(world.lastResponse.body.items[Number(itemIndex)].hasOwnProperty(fieldName));
		assert.ok(world.lastResponse.body.items[Number(itemIndex)][fieldName].hasOwnProperty(innerFieldName));
		assert.ok(world.lastResponse.body.items[Number(itemIndex)][fieldName][innerFieldName] === innerFieldValue);

		done();
	});
};
