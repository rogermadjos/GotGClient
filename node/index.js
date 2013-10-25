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

var refreshTime = 2000;

connection.connect();
setInterval(function() {
	dbutil.updateBattleInvitations(connection);
	console.log('Update Routine');
},refreshTime);

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
	socket.on('retrieve', function (data) {
		dbutil.retrieveInfo(data,connection,function(res) {
			socket.emit('retrieve_res',res);
		});
	});
	socket.on('onetime_update_battleinvitations', function (data) {
		dbutil.getBattleInvitations (connection,function(data) {
			socket.emit('startupdate_battleinvitations_res',{'battleinvitations':data});
		});
	});
	socket.on('post_battleinvitation', function (data) {
		dbutil.postBattleInvitation (data,connection,function(data) {
			socket.emit('post_battleinvitation_res',data);
		});
	});
	socket.on('startupdate_battleinvitations', function (data) {
		var refreshIntervalID;
		var lastChecksum = 0;
		refreshIntervalID = setInterval(function() {
			dbutil.getChecksum('battleinvitations',connection,function(checksum) {
				if(lastChecksum!=checksum) {
					dbutil.getBattleInvitations (connection,function(data) {
						socket.emit('startupdate_battleinvitations_res',{'battleinvitations':data});
					});
				}
				lastChecksum = checksum;
			})
		},refreshTime);
		var handler = function (data) {
			clearInterval(refreshIntervalID);
			console.log('end');
			socket.removeListener('stopupdate_battleinvitations', handler);
		}
		socket.on('stopupdate_battleinvitations', handler);
	});
});