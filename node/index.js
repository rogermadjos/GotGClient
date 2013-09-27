var io = require('socket.io').listen(8001, {log: false});
var mysql = require('mysql');
var connection = mysql.createConnection({
	database : 'gotgdb',
	user     : 'root',
	password : '',
});

connection.connect();

io.sockets.on('connection', function (socket) {
	socket.on('auth', function (data) {
		var query = "select username from users where username='"+data.username+"' and password='"+data.password+"'";
		connection.query(query,function(err,results) {
			if(results.length == 0) {
				socket.emit('auth_response', { response: 'denied' });
			}
			else {
				var nquery = query + " and state=0";
				connection.query(nquery,function(err,results) {
					if(results.length > 0) {
						socket.emit('auth_response', { response: 'verified' });
						nquery = "update users set state=1 where username='"+data.username+"' and password='"+data.password+"'";
						connection.query(nquery);
					}
				});
				nquery = query + " and state=1";
				connection.query(nquery,function(err,results) {
					if(results.length > 0) {
						socket.emit('auth_response', { response: 'already logged in' });
					}
				});
				nquery = query + " and state=2";
				connection.query(nquery,function(err,results) {
					if(results.length > 0) {
						socket.emit('auth_response', { response: 'currently in game' });
					}
				});
			}
		});
	});
});