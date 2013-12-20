var timeout = 30000;

function createRandomBConfig() {
	var coor = new Array();
	for(var y=0;y<3;y++) {
		for(var x=0;x<9;x++) {
			coor[y*9+x] = x +"-"+ y;
		}
	}
	for(var i=0;i<6;i++) {
		var index = Math.floor(Math.random()*(9-i));
		coor.splice(18+index,1);
	}
	var bconfig = "";
	var pieces = new Array();
	pieces[0]= '00';
	pieces[1]= '01';
	pieces[2]= '01';
	for(var i=0;i<12;i++) {
		var rank = i+2;
		if(rank < 10) {
			pieces[i+3] = '0'+rank;
		}
		else {
			pieces[i+3] = ''+rank;
		}
	}
	for(var i=0;i<6;i++) {
		pieces[i+15] = '14';
	}
	var index = Math.floor(Math.random()*18);
	bconfig = bconfig + coor.splice(index,1)+'-'+pieces[0]+';';
	for(var i=1;i<21;i++) {
		var index = Math.floor(Math.random()*(coor.length));
		bconfig = bconfig + coor.splice(index,1)+'-'+pieces[i]+';';
	}
	return bconfig;
}

function convertBConfig(bconfig) {
	bc = new Array();
	for(var i=0;i<21;i++) {
		var info = bconfig.substr(i*7,6);
		var tile = info.substr(0,3);
		var rank = parseInt(info.substr(4,2));
		
		bc[i] = new Object();
		bc[i].tile = tile;
		bc[i].rank = rank;
		bc[i].state = 'active';
	}
	return bc;
}

function positions(bconfig) {
	bc = new Array();
	for(var i=0;i<21;i++) {
		var info = bconfig.substr(i*7,6);
		var tile = info.substr(0,3);
		var rank = parseInt(info.substr(4,2));

		bc[i] = tile;
	}
	return bc;
}

exports.startBattle = function(opponent, challenger, environment) {
	console.log('Battle started\nOpponent:\t'+opponent+'\nChallenger:\t'+challenger+'\n');
	var opponentsocket = null;
	var challengersocket = null;
	environment.dbutil.getSocket(opponent,environment.connection,function(socketid) {
		if(socketid!=null) {
			opponentsocket = environment.io.sockets.socket(socketid);
		}
		environment.dbutil.getSocket(challenger,environment.connection,function(socketid) {
			if(socketid!=null) {
				challengersocket = environment.io.sockets.socket(socketid);
			}
			if(opponentsocket!=null && challengersocket!=null) {
				var opponentactive = false;
				var challengeractive = false;
				var expireid = setTimeout(function() {
					opponentsocket.removeAllListeners('testconnect_res');
					opponentsocket.removeAllListeners('testconnect_res');
				},timeout);
				var testhandle = function(identity) {
					if(!opponentactive) {
						opponentactive = opponent == identity;
					}
					if(!challengeractive) {
						challengeractive = challenger == identity;
					}
					if(opponentactive && challengeractive) {
						clearTimeout(expireid);
						var ostate = new Object;
						var cstate = new Object;
						environment.dbutil.getBConfig(opponent,environment.connection,function(bconfig) {
							ostate.bconfig = bconfig;
							environment.dbutil.getBConfig(challenger,environment.connection,function(bconfig) {
								cstate.bconfig = bconfig;
								if(ostate.bconfig==null) {
									ostate.bconfig = createRandomBConfig();
								}
								if(cstate.bconfig==null) {
									cstate.bconfig = createRandomBConfig();
								}
								var toggle = Math.random() > 0.5;
								
								var opponentbconfig = convertBConfig(ostate.bconfig);
								var challengerbconfig = convertBConfig(cstate.bconfig);
								
								var data = {
										'bconfig':opponentbconfig,
										'enemybconfig':positions(cstate.bconfig)
								}
								opponentsocket.emit('battlestart',data);
								
								data = {
										'bconfig':challengerbconfig,
										'enemybconfig':positions(ostate.bconfig)
								}
								challengersocket.emit('battlestart',data);
								
								var one = {
										'bconfig':opponentbconfig,
										'name':'opponent',
										'socket':opponentsocket
								}
								var two = {
										'bconfig':challengerbconfig,
										'name':'challenger',
										'socket':challengersocket
								}
								if(!toggle) {
									var three = one;
									one = two;
									two = three;
								}
								var response = null;
								var result = null;
								var turn = function() {
									if(response!=null) {
										response.result = result;
									}
									one.socket.emit('turnsignal',response);
									one.socket.once('turnreturn',function(data) {
										var from = one.bconfig[data.number].tile;
										var to = data.newc;
										var x = 8 - parseInt(to.substr(0,1));
										var y = 7 - parseInt(to.substr(2,1));
										var totrans = x+"-"+y;
										response = {
												'from':from,
												'to':to,
												'move':data.move,
										}
										one.bconfig[data.number].tile = data.newc;
										var engage = false;
										var twon = 0;
										var left = one.bconfig[data.number];
										var right = null;
										for(var i=0;i<two.bconfig.length;i++) {
											if(two.bconfig[i].tile == totrans && two.bconfig[i].state == 'active') {
												engage = true;
												right = two.bconfig[i];
												twon = i;
												break;
											}
										}
										var next = function() {
											var three = one;
											one = two;
											two = three;
											turn();
										}
										result = null;
										if(engage) {
											var resultL = "draw";
											var resultR = "draw";
											if(left.rank == 0) {
												if(right.rank == 0) {
													resultL = "win";
													resultR = "lose";
												}
												else {
													resultL = "lose";
													resultR = "win";
												}
											}
											else if(left.rank == 1) {
												if(right.rank == 0) {
													resultL = "win";
													resultR = "lose";
												}
												else if(right.rank == 1) {
												}
												else if(right.rank < 14) {
													resultL = "win";
													resultR = "lose";
												}
												else {
													resultL = "lose";
													resultR = "win";
												}
											}
											else if(left.rank == 14) {
												if(right.rank == 1) {
													resultL = "win";
													resultR = "lose";
												}
												else if(right.rank == 14) {
													
												}
												else if(right.rank == 0) {
													resultL = "win";
													resultR = "lose";
												}
												else {
													resultL = "lose";
													resultR = "win";
												}
											}
											else {
												if(left.rank == right.rank) {
												}
												else if(left.rank > right.rank) {
													resultL = "lose";
													resultR = "win";
												}
												else if(right.rank == 0) {
													resultL = "win";
													resultR = "lose";
												}
												else {
													resultL = "win";
													resultR = "lose";
												}
											}
											var d = {
												'result':resultL,
												'number':data.number
											}
											onen = data.number;
											if(resultL == 'lose' || resultL == 'draw') {
												one.bconfig[onen].state = 'inactive';
											}
											if(resultR == 'lose' || resultR == 'draw') {
												two.bconfig[twon].state = 'inactive';
											}
											result = resultR;
											one.socket.emit('battlereport',d);
											one.socket.once('battlereportack',function() {
												next();
											});
										}
										else {
											next();
										}
									});
								};
								turn();
							});
						});
					}
				}
				opponentsocket.emit('testconnect');
				challengersocket.emit('testconnect');
				
				opponentsocket.once('testconnect_res',testhandle);
				challengersocket.once('testconnect_res',testhandle);
			}
		});
	});
}