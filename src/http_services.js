'use strict';

const restify = require('restify');
const logger = require('./logger');
const transactionHeader = require('./transactionIdHeader');
const debugHeader = require('./debugHeader');

const server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(transactionHeader);
server.use(debugHeader);

require('./features')(server);

server.on('after', (req, res, route, err) => {
	if (err) {
		return logger.error(`${req.method} ${req.url} ${res.statusCode} route:${JSON.stringify(route)} err:${err}`, req);
	}
	logger.info(`${req.method} ${req.url} ${res.statusCode}`, req);
});

server.on('uncaughtException', (req, res, route, err) => {
	logger.error(`uncaughtException ${req.method} ${req.url} err:${err}`, req);
	res.send(500, {err: 'internal_error'});
});

server.on('InternalServer', function (req, res, err, cb) {
	logger.error(`InternalServer ${req.method} ${req.url} ${res.statusCode} ${JSON.stringify(err)}`, req);
	err.body = 'something is wrong!';
	return cb();
});

module.exports = {

	start: port => {
		return new Promise(
			(resolve, reject) => {
				require('./tasks');

				server.listen(port, err => {
					if (err) {
						reject(err);
					}
					else {
						resolve(server);
					}
				});
			}
		);
	}
};
