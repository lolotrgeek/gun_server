; (function () {
	const cluster = require('cluster');
	if (cluster.isMaster) {
		return cluster.fork() && cluster.on('exit', function () { cluster.fork() });
	}

	const fs = require('fs');
	const config = {
		port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765,
		host: '192.168.1.109'
	};
	const Gun = require('gun')
	const GunSQLite = require('gun-sqlite');
	const adapter = GunSQLite.bootstrap(Gun);

	if (process.env.HTTPS_KEY) {
		config.key = fs.readFileSync(process.env.HTTPS_KEY);
		config.cert = fs.readFileSync(process.env.HTTPS_CERT);
		config.server = require('https').createServer(config, Gun.serve(__dirname));
	} else {
		config.server = require('http').createServer(Gun.serve(__dirname));
	}

	console.log('GUN config ', config)
	const gun = Gun({
		web: config.server.listen(config.port, config.host),
		file: false,
		radisk: false,
		localStorage: false,
		// Defaults
		sqlite: {
			database_name: "GunDB.db",
		}
	});
	console.log('Relay peer started on port ' + config.port + ' with /gun');

	module.exports = gun;
}());