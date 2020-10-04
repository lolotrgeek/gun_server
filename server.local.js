; (function () {
	const cluster = require('cluster')
	if (cluster.isMaster) {
		return cluster.fork() && cluster.on('exit', function () { cluster.fork() })
	}

	const fs = require('fs')
	const config = {
		port: process.env.PORT || 8765,
		host: '192.168.1.109'
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
	const gun = Gun({ web: config.server.listen(config.port) })
	console.log(`Relay peer started on ${config.host}:${config.port}/gun`)

	// gun.get('server').get('status').put('online')

	module.exports = gun
}());