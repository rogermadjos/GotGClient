var io = require('socket.io').listen(8001, {log: false});
var util = require('./util');
var mysql = require('mysql');
var connection = mysql.createConnection({
	database : 'gotgdb',
	user     : 'root',
	password : '',
});

connection.connect();

io.sockets.on('connection', function (socket) {
	socket.on('auth', function (data) {
		var responses = ['denied','verified','logged in','in game'];
		util.checkAuth(connection,data.username, data.password,function(res) {
			if(res>=0) {
				util.assignLoginID(connection,data.username,function(id) {
					socket.emit('auth_response', { response: responses[res+1], 'id':id});
				});
			}
			else {
				socket.emit('auth_response', { response: responses[res+1], 'id':''});
			}
			
		});
	});
	
});