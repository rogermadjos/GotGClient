var io = require('socket.io').listen(8001, {log: false});

io.sockets.on('connection', function (socket) {
	socket.on('auth', function (data) {
		console.log(data.password);
	});
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});