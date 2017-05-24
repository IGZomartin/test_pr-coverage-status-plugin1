'use strict';

module.exports = server => {
	server.post('/api/feature', require('./create_endpoint'));
	server.get('/api/features', require('./find_endpoint'));
	server.get('/api/feature/:featureId', require('./retrieve_endpoint'));
	server.put('/api/feature/:featureId', require('./update_endpoint'));
	server.del('/api/feature/:featureId', require('./delete_endpoint'));
};
