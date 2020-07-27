; (function () {
	const cluster = require('cluster')
	if (cluster.isMaster) {
		return cluster.fork() && cluster.on('exit', function () { cluster.fork() })
	}

	const fs = require('fs')
	const config = {
		port: process.env.PORT || 8765,
		host: '0.0.0.0'
	};
	const Gun = require('gun')

	if (process.env.HTTPS_KEY) {
		config.key = fs.readFileSync(process.env.HTTPS_KEY)
		config.cert = fs.readFileSync(process.env.HTTPS_CERT)
		config.server = require('https').createServer(config, Gun.serve(__dirname))
	} else {
		config.server = require('http').createServer(Gun.serve(__dirname))
	}

	console.log('GUN config ', config)
	const gun = Gun({ web: config.server.listen(config.port, config.host) })
	console.log('Relay peer started on port ' + config.port + ' with /gun')

	// ;(function () {
	// 	setInterval(() => {
	// 		let peers = gun.back('opt.peers')
	// 		console.log(peers)
	// 	}, 3000)
	// })();
	
	gun.get('tabs').on((data, key) => {
		let peers = gun.back('opt.peers')
		console.log(peers)
	})


	module.exports = gun
}());