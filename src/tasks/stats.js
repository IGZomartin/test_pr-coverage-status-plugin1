'use strict';

const moment = require('moment');
const logger = require('../logger');
const config = require('../config');
const gecko = require('../tools/gecko');

const dbConn = require('../database/connection');

const DOC_NAME = 'features';
const DOC_COLLECTION = 'features';
const STATS_COLLECTION = 'stats';
const STATS_TYPE = 'features_count';
const TRANSACTION_ID = `count_${DOC_NAME}`;

const ONE_DAY = 24 * 60 * 60 * 1000;

const statForDate = date => {
	return new Promise((ok, ko) => {
		dbConn().then(db => {
			db.collection(STATS_COLLECTION).findOne({type: STATS_TYPE, date}, (err, yesterdayStat) => {
				if (err) {
					return ko(err);
				}

				ok(yesterdayStat);
			});
		});
	});
};

const count = () => {
	return new Promise((ok, ko) => {
		dbConn().then(db => {
			db.collection(DOC_COLLECTION).count((err, count) => {
				if (err) {
					logger.error(`stats error for ${DOC_NAME} on database ${err} ${JSON.stringify(err)}`, {transactionId: TRANSACTION_ID});
					return ko(err);
				}

				const now = moment().startOf('minute');
				const newStat = {
					type: STATS_TYPE,
					date: now.toDate(),
					count
				};

				db.collection(STATS_COLLECTION).update({
					type: newStat.type,
					date: newStat.date
				}, newStat, {upsert: true}, err => {
					if (err) {
						logger.error(`stats error for ${DOC_NAME} on database ${err} ${JSON.stringify(err)}`, {transactionId: TRANSACTION_ID});
						return ko(err);
					}
				});

				if (!config.gecko) {
					return ok(count);
				}

				// Total count with daily trend
				let promises = [];
				for (let i = 1; i < 15; i++) {
					const pastDate = moment().subtract(i, 'day').startOf('minute');
					promises.push(statForDate(pastDate.toDate()));
				}
				Promise.all(promises)
					.then(pastStats => {
						const trend = pastStats.reduce((reducer, stat) => {
							const todayTotal = stat ? stat.count : 0;
							const todayIncrement = reducer.previous - todayTotal;

							reducer.daily.push(todayIncrement);
							reducer.previous = todayTotal;
							return reducer;
						}, {previous: count, daily: []});
						trend.daily.reverse();

						const geckoData = {
							item: [
								{value: count, text: 'today'},
								trend.daily
							]
						};

						gecko.send(config.gecko.url.count, geckoData, TRANSACTION_ID);
					})
					.catch(err => {
						logger.error(`stats error for ${DOC_NAME} on database ${err} ${JSON.stringify(err)}`, {transactionId: TRANSACTION_ID});
					});

				return ok(count);
			});
		});
	});
};

module.exports = () => {
	count()
		.then(count => {
			logger.info(`${count} ${DOC_NAME} found on database`, {transactionId: TRANSACTION_ID});
		});

	setInterval(count, ONE_DAY);
};
