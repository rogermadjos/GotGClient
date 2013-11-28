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
var refreshTime = 20000;

connection.connect();

setInterval(function() {
	dbutil.updateBattleInvitations(connection,function(res) {
		if(res) {
			dbutil.getBattleInvitations(connection,function(res) {
				io.sockets.emit('battleinvitations_update',res);
			});
		}
	});
	dbutil.updateBattleChallenges(connection,function(res) {
		if(res) {
			
		}
	});
},refreshTime);

io.sockets.on('connection', function (socket) {
	socket.on('cancelbattleinvitation', function (data) {
		dbutil.cancelBattleInvitation(data,connection,function(res) {
			socket.emit('cancelbattleinvitation_res',res);
			dbutil.getBattleInvitations(connection,function(res) {
				console.log('broadcast');
				io.sockets.emit('battleinvitations_update',res);
			});
		});
	});
	socket.on('postbattleinvitation', function (data) {
		dbutil.postBattleInvitation(data,connection,function(res) {
			socket.emit('postbattleinvitation_res',res);
			dbutil.getBattleInvitations(connection,function(res) {
				console.log('broadcast');
				io.sockets.emit('battleinvitations_update',res);
			});
		});
	});
	socket.on('getbattleinvitations', function (data) {
		dbutil.getBattleInvitations(connection,function(res) {
			socket.emit('battleinvitations_update',res);
		});
	});
	socket.on('challenge', function (data) {
		dbutil.challengeBattle(data,connection,function(res) {
			socket.emit('challenge_res',res);
			if(res=='Success') {
				dbutil.getSocket(data,connection,function(socketid) {
					if(socketid!=null) {
						dbutil.getChallengers(data.opponent,connection,function(res) {
							io.sockets.socket(socketid).emit('challengers_update',res);
						});
					}
				});
			}
		});
	});
	socket.on('getchallengers', function (data) {
		dbutil.getChallengers(data.username,connection,function(res) {
			socket.emit('challengers_update',res);
		});
	});
	socket.on('getchallengedata', function (data) {
		dbutil.getChallengeData(data.username,connection,function(res) {
			socket.emit('opponents_update',res);
		});
	});
	socket.on('acceptchallenge', function (data) {
		dbutil.checkBattleValid(data,connection,function(res) {
			if(res) {
				dbutil.getSocket(data.challenger,connection,function(socketid) {
					if(socketid!=null) {
						socket.emit('acceptchallenge_res','Success');
						io.sockets.socket(socketid).emit('challenge_accepted',data.username);
					}
					else {
						socket.emit('acceptchallenge_res','Failed');
					}
				});
			}
			else {
				socket.emit('acceptchallenge_res','Failed');
			}
		});
	});
	socket.on('cancelchallenge', function (data) {
		dbutil.cancelChallenge(data,connection,function(res) {
			socket.emit('cancelchallenge_res',res);
			dbutil.getChallengeData(data.username,connection,function(res) {
				socket.emit('opponents_update',res);
				if(res!="Failed") {
					dbutil.getSocket(data.opponent,connection,function(socketid) {
						if(socketid!=null) {
							dbutil.getChallengers(data.opponent,connection,function(res) {
								io.sockets.socket(socketid).emit('challengers_update',res);
							});
						}
					});
				}
			});
		});
	});
	socket.on('change', function (data) {
		dbutil.changeAccountInfo(data,connection,function(res) {
			socket.emit('change_res',res);
		});
	});
	socket.on('retrieve', function (data) {
		dbutil.retrieveInfo(data,connection,function(res) {
			socket.emit('retrieve_res',res);
		});
	});
	socket.on('register', function (data) {
		dbutil.register(data,connection,function(res) {
			socket.emit('register_res',res);
		});
	});
	socket.on('login', function (data) {
		dbutil.login(data,connection,function(res) {
			if(res=="Valid") {
				dbutil.saveSocket({'username':data.username,'socketid':socket.id},connection,function() {
					socket.emit('login_res',res);
				});
			}
			else {
				socket.emit('login_res',res);
			}
		});
	});
	socket.on('logout',function() {
		dbutil.deleteSocket(socket.id,connection);
	})
	socket.on('disconnect',function() {
		dbutil.deleteSocket(socket.id,connection);
	})
});