console.log("GotG server has been started.");

var io = require('socket.io').listen(8050, {log: false});
var mysql      = require('mysql');
var dbutil = require('./gotgdb.js');
var gameutil = require('./gamescript.js');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'gotgdb'
});

var timeout = 5000;
var refreshTime = 1000;

connection.connect();

io.sockets.on('connection', function (socket) {
	var battleInvitationsUpdate = function() {
		dbutil.getBattleInvitations (connection,function(data) {
			socket.broadcast.emit('startupdate_battleinvitations_res',{'battleinvitations':data});
		});
	};
	socket.on('register', function (data) {
		dbutil.register(data,connection,function(res) {
			socket.emit('register_res',{'response':res});
		});
	});
	socket.on('login', function (data) {
		dbutil.login(data,connection,function(res) {
			socket.emit('login_res',res);
		});
	});
});