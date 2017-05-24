"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body has a "([^"]*)" field with an inner "([^"]*)" field/, (fieldName, innerFieldName, done) => {
		const world = this.world;
		assert.ok(world.lastResponse.body.hasOwnProperty(fieldName));
		assert.ok(world.lastResponse.body[fieldName].hasOwnProperty(innerFieldName));

		done();
	});
};
