"use strict";

const assert = require('assert');

module.exports = function () {
	this.Then(/^the response body has a "([^"]*)" field with the following json params/, (fieldName, jsonValue, done) => {
		const world = this.world;

		assert.ok(world.lastResponse.body.hasOwnProperty(fieldName));

		jsonValue = JSON.parse(jsonValue);
		Object.keys(jsonValue).forEach(function(key){
			assert.ok(world.lastResponse.body[fieldName].hasOwnProperty(key));
			assert.ok(world.lastResponse.body[fieldName][key] === jsonValue[key]);
		});

		done();
	});
};
