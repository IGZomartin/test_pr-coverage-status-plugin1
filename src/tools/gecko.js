'use strict';

const logger = require('../logger');
const config = require('../config');
const request = require('request');

module.exports = {
	send: (url, data, transactionId) => {
		if(!config.gecko) return;
		
		const options = {
			url,
			method: 'POST',
			json: true,
			body: {
				api_key: config.gecko.apiKey,
				data
			}
		};

		request(options, err => {
			if (err) {
				logger.error(`error sending data to gecko ${err} ${JSON.stringify(err)}`, {transactionId});
			}
		});
	}
};
