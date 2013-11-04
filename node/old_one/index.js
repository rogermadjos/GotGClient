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

var timeout = 30000;
var refreshTime = 1000;

connection.connect();
setInterval(function() {
	dbutil.updateBattleInvitations(connection);
	dbutil.updateBattleChallenges(connection);
},refreshTime*10);

var connectionSockets = new Object();

function expiringCall(event,timeout, socket, handler, timeoutHandler) {
	var func = function(data) {
		clearTimeout(tevent);
		socket.removeListener(event,func);
		handler(data);
	}
	var tevent = setTimeout(function() {
		socket.removeListener(event,func);
		timeoutHandler();
	},timeout);
	socket.on(event,func);
}

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
			if(res == 'Valid') {
				dbutil.getUserId(data.username,connection,function(userid) {
					if(userid != null) {
						connectionSockets[userid] = socket.id;
					}
				});
			}
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
	socket.on('prepare_battle', function(data) {
		console.log('prepare battle\nopponent: '+data.username+'\nchallenger: '+data.challenger);
		dbutil.getUserId(data.challenger,connection,function(userid) {
			if(userid != null) {
				var socketid = connectionSockets[userid];
				if(socketid != null) {
					console.log('sockets');
					var mysocket = io.sockets.sockets[socketid];
					if(mysocket != null) {
						console.log('mysockets');
						if(!mysocket.disconnected) {
							console.log('mysockets');

							var opponentBoardConfig, challengerBoardConfig;
							socket.emit('get_battle_config');
							expiringCall('get_battle_config_res',timeout, socket, function(data2) {
								console.log('opponent boardconfig');
								opponentBoardConfig = data2;
								mysocket.emit('get_battle_config');
								expiringCall('get_battle_config_res',timeout, mysocket, function(data3) {
									console.log(data.challenger +'challenger boardconfig');
									challengerBoardConfig = data3;
									
									mysocket.emit('challenge_accepted',{'opponent':data.username});
									
									var res = {
										'response':'Succeeded'
									};
									socket.emit('prepare_battle_res',res);
									
									expiringCall('battle_decide',timeout, mysocket, function(data4) {
										if(data4 == 'start') {
											socket.emit('battle_engage','commence');
											mysocket.emit('battle_engage','commence');
											
											gameutil.startGame(data.username,data.challenger,opponentBoardConfig, challengerBoardConfig, socket, mysocket);
										}
										else {
											socket.emit('battle_engage','abort');
										}
									}, function() {});

								}, function() {
									socket.emit('prepare_battle_res',{'response':'Failed'});
								});
							}, function() {
								socket.emit('prepare_battle_res',{'response':'Failed'});
							});
						}
						else {
							socket.emit('prepare_battle_res',{'response':'Failed'});
						}
					}
					else {
						socket.emit('prepare_battle_res',{'response':'Failed'});
					}
				}
				else {
					socket.emit('prepare_battle_res',{'response':'Failed'});
				}
			}
			else {
				//error
			}
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
		battleInvitationsUpdate();
		var handler = function (data) {
			clearInterval(refreshIntervalID);
			socket.removeListener('stopupdate_battleinvitations', handler);
		}
		socket.on('stopupdate_battleinvitations', handler);
	});
});