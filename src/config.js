'use strict';

const config = require('./config.json');
config.DB_URI = process.env.DB_URI || config.DB_URI;

if (process.env.PAPERTRAIL_HOST) {
	config.papertrail = {
		host: process.env.PAPERTRAIL_HOST,
		port: process.env.PAPERTRAIL_PORT
	};
}

if (process.env.GECKO_APIKEY) {
	config.gecko = {
		apiKey: process.env.GECKO_APIKEY,
		url: {
			count: process.env.GECKO_WIDGET_STEP_COUNT
		}
	};
}

module.exports = config;
