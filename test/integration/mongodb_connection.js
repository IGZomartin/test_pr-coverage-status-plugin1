'use strict';

const connection = require(`${process.cwd()}/src/database/connection`);

describe('MongoDB connection', function () {
	this.timeout(3000);

	before(function (done) {
		done();
	});

	it('Should connect with MongoDB', done => {
		connection()
			.then(() => done())
			.catch(done);
	});

});
