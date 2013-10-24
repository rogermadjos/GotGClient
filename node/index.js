console.log("GotG server has been started.");

var io = require('socket.io').listen(8050, {log: false});
var mysql      = require('mysql');
var dbutil = require('./gotgdb.js');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'gotgdb'
});

connection.connect();

io.sockets.on('connection', function (socket) {
	socket.on('register', function (data) {
		dbutil.register(data,connection,function(res) {
			socket.emit('register_res',{'response':res});
		});
	});
	socket.on('login', function (data) {
		dbutil.login(data,connection,function(res) {
			socket.emit('login_res',{'response':res});
		});
	});
});