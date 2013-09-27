var io = require('socket.io').listen(80);

io.sockets.on('connection', function (socket) {
	socket.on('auth', function (data) {
		console.log(data.username);
	});
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});