; (function () {
	const cluster = require('cluster');
	if (cluster.isMaster) {
		return cluster.fork() && cluster.on('exit', function () { cluster.fork() });
	}

	const fs = require('fs');
	const config = {
		port: process.env.PORT || 8765,
		host: '0.0.0.0'
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

	(function () {
		setInterval(() => {
			let peers = gun.back('opt.peers')
			console.log(peers)
		}, 7000)
	})();
	
	module.exports = gun;
}());