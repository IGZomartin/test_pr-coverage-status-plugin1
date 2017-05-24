"use strict";

const assert = require("assert");

module.exports = function () {
	this.Then(/^the response status code is (\d+)$/, (statusCode, done) => {
		const world = this.world;
		assert.equal(world.lastResponse.statusCode, Number(statusCode));
		done()
	});
};
