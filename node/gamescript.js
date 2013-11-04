exports.gamestates = new Object();

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

exports.startGame = function(opponent, challenger, opponentBoardConfig, challengerBoardConfig, opponentSocket, challengerSocket) {
	var timeout = 60000;
	var flip = function(pos) {
		var charSet = 'ABCDEFGHI';
		var newpos = charSet.charAt(8-charSet.indexOf(pos.charAt(0))) + (9-parseInt(pos.charAt(1)));
		return newpos;
	}
	var sendEnemyInfo = function(socket, boardConfig) {
		var info = new Array();
		
		for(var i=0;i<boardConfig.length;i++) {
			var pos = boardConfig[i].position;
			
			info[i] = {
					'position':flip(pos),
					'state':'active'
			}
		}
		socket.emit('enemy_info',info);
	}
	
	console.log('Battle started\t\topponent:'+opponent+"\tchallenger:"+challenger);
	
	sendEnemyInfo(opponentSocket,challengerBoardConfig);
	sendEnemyInfo(challengerSocket,opponentBoardConfig);
	
	var firstMove = Math.round(Math.random());
	var one = {
		'username':opponent,
		'boardConfig':opponentBoardConfig,
		'socket':opponentSocket
	}
	var two = {
		'username':challenger,
		'boardConfig':challengerBoardConfig,
		'socket':challengerSocket
	}
	if(firstMove) {
		var temp = two;
		two = one;
		one = temp;
	}
	
	var move = function(data) {
		if(data!=null) {
			one.socket.emit('move',{'from':flip(data.from),'to':flip(data.to)});
		}
		else {
			one.socket.emit('move');
		}
		
		expiringCall('move_res',timeout, one.socket, function(data) {
			two.socket.emit('move',{'from':flip(data.from),'to':flip(data.to)});
			expiringCall('move_res',timeout, two.socket, function(data) {
				move(data);
			}, function(){});
		}, function(){});
	}

	move();
}