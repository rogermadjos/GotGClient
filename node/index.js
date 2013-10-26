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

var refreshTime = 1000;

connection.connect();
setInterval(function() {
	dbutil.updateBattleInvitations(connection);
	console.log('Update Routine');
},refreshTime*10);

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
			if(data.response != "Failed") {
				battleInvitationsUpdate();
			}
		});
	});
	socket.on('cancel_battleinvitation', function (data) {
		dbutil.cancelBattleInvitation (data,connection,function(data) {
			socket.emit('cancel_battleinvitation_res',data);
			battleInvitationsUpdate();
		});
	});
	socket.on('challenge', function (data) {
		dbutil.challengeBattle (data,connection,function(data) {
			socket.emit('challenge_res',data);
		});
	});
	socket.on('getchallengedata', function (data) {
		dbutil.getChallengeData (data,connection,function(value) {
			socket.emit('getchallengedata_res',value);
		});
	});
	socket.on('cancelchallenge', function (data) {
		dbutil.cancelChallenge (data,connection,function(v) {
			dbutil.getChallengeData (data,connection,function(res) {
				socket.emit('getchallengedata_res',res);
			});
		});
	});
	socket.on('startupdate_challengers', function (data) {
		var refreshIntervalID;
		var lastChecksum = 0;
		refreshIntervalID = setInterval(function() {
			dbutil.getChecksum('challengers',connection,function(checksum) {
				if(lastChecksum!=checksum) {
					dbutil.getChallengers (data,connection,function(res) {
						socket.emit('startupdate_challengers_res',res);
					});
				}
				lastChecksum = checksum;
			})
		},refreshTime);
		var handler = function (data) {
			clearInterval(refreshIntervalID);
			socket.removeListener('stopupdate_challengers', handler);
		}
		socket.on('stopupdate_challengers', handler);
	});
	socket.on('startupdate_battleinvitations', function (data) {
		var refreshIntervalID;
//		var lastChecksum = 0;
//		refreshIntervalID = setInterval(function() {
//			dbutil.getChecksum('battleinvitations',connection,function(checksum) {
//				if(lastChecksum!=checksum) {
//					dbutil.getBattleInvitations (connection,function(data) {
//						socket.emit('startupdate_battleinvitations_res',{'battleinvitations':data});
//					});
//				}
//				lastChecksum = checksum;
//			})
//		},refreshTime);
		battleInvitationsUpdate();
		var handler = function (data) {
			clearInterval(refreshIntervalID);
			socket.removeListener('stopupdate_battleinvitations', handler);
		}
		socket.on('stopupdate_battleinvitations', handler);
	});
});