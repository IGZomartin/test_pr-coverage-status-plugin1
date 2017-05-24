'use strict';

const config = require('../config.js');
const MongoClient = require('mongodb').MongoClient;
const logger = require('../logger');

let isConnected = false;
let currentDb;

module.exports = () =>
	new Promise((resolve, reject) => {
		if (isConnected) {
			return resolve(currentDb);
		}

		MongoClient.connect(config.DB_URI, (err, db) => {
			if (err) {
				logger.error(`Error when try to connect to DB: ${err}`, {transactionId: 'db_start'});
				return reject(err);
			}
			logger.info('connected to database', {transactionId: 'db_start'});

			db.on('error', err => {
				logger.error(`db error: ${JSON.stringify(err)}`, {transactionId: 'db_error'});
			});

			db.on('close', () => {
				isConnected = false;
				logger.error('db closed', {transactionId: 'db_close'});
			});

			db.on('reconnect', () => {
				isConnected = true;
				logger.warn('db reconnect', {transactionId: 'db_reconnect'});
			});

			db.on('timeout', err => {
				logger.error(`db timeout: ${JSON.stringify(err)}`, {transactionId: 'db_timeout'});
			});

			db.collection('features').count((err, count) => {
				logger.info(`${count} features found on database`, {transactionId: 'db_start'});
			});

			currentDb = db;
			isConnected = true;

			resolve(currentDb);
		});
	});
