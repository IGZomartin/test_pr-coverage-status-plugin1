'use strict';

const config = require('./config.js');
const httpServices = require('./http_services.js');
const logger = require('./logger');

httpServices
	.start(config.PORT)
	.then(server => {
		logger.info(`service listening on ${server.url}`, {transactionId: 'service_start'});
	})
	.catch(error => {
		logger.info(`error stating service: ${error}`, {transactionId: 'service_start'});
	});
