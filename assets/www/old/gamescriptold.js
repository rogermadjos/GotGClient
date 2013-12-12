
var pieceImageNames = 
[
	"5-star.png",
	"4-star.png",
	"3-star.png",
	"2-star.png",
	"1-star.png",
	"colonel.png",
	"leutenantcolonel.png",
	"major.png",
	"captain.png",
	"firstleutenant.png",
	"secondleutenant.png",
	"sergeant.png",
	"private.png",
	"spy.png",
	"flag.png",
];

var dirImg = ["right.png","left.png","up.png","down.png"];

function getInitialBattleConfig(callback) {
	var configName = "Random";
	var boardConfig = new Array();
	
	if(configName == 'Random') {
		var coors = new Array();
		var i = 0;
		for(var y=1;y<=3;y++) {
			for(var x=0;x<9;x++) {
				coors[i] = String.fromCharCode(x+65) + y;
				i=i+1;
			}
		}
		for(var i=0;i<6;i++) {
			var index = 18 + Math.floor(Math.random()*(8-i));
			coors.splice(index, 1);
		}
		var index = 0;
		boardConfig[index] = {
			'rank': 14,
			'state': 'active',
			'position': coors.splice(Math.floor(Math.random()*coors.length), 1)[0]
		}
		
		for(var i=0;i<2;i++) {
			index = index + 1;
			boardConfig[index] = {
				'rank': 13,
				'state': 'active',
				'position': coors.splice(Math.floor(Math.random()*coors.length), 1)[0]
			}
			
		}
		
		for(var i=0;i<6;i++) {
			index = index + 1;
			boardConfig[index] = {
				'rank': 12,
				'state': 'active',
				'position': coors.splice(Math.floor(Math.random()*coors.length), 1)[0]
			}
		}
		
		for(var i=0;i<12;i++) {
			index = index + 1;
			boardConfig[index] = {
				'rank': 11-i,
				'state': 'active',
				'position': coors.splice(Math.floor(Math.random()*coors.length), 1)[0]
			}
		}
		
		callback(boardConfig);
	}
}

function expiringCall(event,timeout, handler, timeoutHandler) {
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

function prepareBoard() {
	
	var operations = function() {
		var selection = "";
		
		var enableSelection = false;
		
		socket.on('move',function(data) {
			enableSelection = true;
			$("#indicator").attr('src','images/state_green.png');
			if(data != null) {
				var html = $('#'+data.from).html();
				$('#'+data.from).html('');
				$('#'+data.to).html(html);
			}
		});
		
		var gameboard = $("#gameboard");
		gameboard.addClass('gameboard');
		gameboard.height($(window).height()*6/14);
		
		$("#gameareacon").width($(window).width() - 35);
		
		var pieceHeight = ($(window).height()*6/14 - 40) / 8;
		var pieceWidth = ($(window).width() - 85) / 9;
		
		var html = "<table border='1'  class='gametable' style='table-layout:fixed'>";
		for(var i=1;i<=8;i++) {
			html += "<tr height='"+(pieceHeight+5)+"'>";
			for(var j=1;j<=9;j++) {
				var coor = String.fromCharCode(j+64) + (9-i);
				html += "<td width='"+pieceWidth+"' id='"+coor+"' class='coordinate'>";
				html += "</td>";
			}
			html += "</tr>";
		}
		html += "</table>";
		gameboard.html(html);
		
		console.log(boardConfig);
		
		for(var i=0;i<boardConfig.length;i++) {
			var container = $("#"+boardConfig[i].position);
			var html = "<div class='piece'><img style='margin-bottom:-3px' src='images/"+pieceImageNames[boardConfig[i].rank]+"' width='"+pieceWidth+"' height='"+pieceHeight+"'><div>";
			container.html(html);
		}
		
		for(var i=0;i<enemyConfig.length;i++) {
			var container = $("#"+enemyConfig[i].position);
			var html = "<div class='enemy'><img style='margin-bottom:-3px' src='images/enemy.png' width='"+pieceWidth+"' height='"+pieceHeight+"'><div>";
			container.html(html);
		}
		
		$('.coordinate').click(function() {
			var position = $(this).attr('id');
			
			if($(this).has('.arrow').length) {
				$(".highlight").remove();
				$(".arrow").remove();
				var html = $('#'+selection).html();
				$('#'+selection).html('');
				$(this).html(html);
				
				var data = {
					'from':selection,
					'to':position
				}
				
				console.log(data);
				
				socket.emit('move_res',data);
				enableSelection = false;
				$("#indicator").attr('src','images/state_red.png');
				return;
			}
			
			$(".highlight").remove();
			$(".arrow").remove();
			if($(this).has('.piece').length && enableSelection) {
				
				selection = position;
				
				$(this).append("<div class='highlight' style='margin-top:-"+pieceHeight+"px;height:"+pieceHeight+"px'><image src='images/highlight.png' width='"+pieceWidth+"' height='"+pieceHeight+"'/></div>");
				var charSet = 'ABCDEFGHI';
				var x = charSet.indexOf(position.charAt(0));
				var y = parseInt(position.charAt(1)) - 1;
				
 				var vmoves = new Array();
 				var index = 0;
 				if(x + 1 < 9) {
 					vmoves[index++] = "r"+charSet.charAt(x+1)+""+(y+1);
 				}
 				if(x-1 >= 0) {
 					vmoves[index++] = "l"+charSet.charAt(x-1) +""+(y+1);
 				}
 				if(y+1 < 8) {
 					vmoves[index++] = "u"+charSet.charAt(x) +""+(y+2);
 				}
 				if(y-1 >=0) {
 					vmoves[index++] = "d"+charSet.charAt(x) +""+(y);
 				}
 				
 				var dirSet = "rlud";
 				for(var i=0;i<vmoves.length;i++) {
 					var info = vmoves[i];
 					var dir = info.charAt(0);
 					dir = dirImg[dirSet.indexOf(dir)];
 					info = info.charAt(1)+""+info.charAt(2);
 					var tile = $("#"+info);
  					if(!tile.has('.piece').length) {
  						if(!tile.has('.enemy').length) {
  							var html = "<div class='arrow'><img style='margin-bottom:-3px;margin-left:0px' src='images/"+dir+"' width='"+pieceWidth+"' height='"+pieceHeight+"'><div>";
  	  						tile.html(html);
  						}
  						else {
  							tile.append("<div class='arrow' style='margin-top:-"+pieceHeight+"px;height:"+pieceHeight+"px'><image style='margin-left:0px' src='images/"+dir+"' width='"+pieceWidth+"' height='"+pieceHeight+"'/></div>");
  						}
  					}
 				}
			}

		});
		
		$("#gamearea").css("display","block");
		$("#gamearea").addClass("fadein");
		
	}
	
	var func = function() {
		getEnemyConfig(function() {
			operations();
		});
	}
	if(boardConfig != null) {
		func();
	}
	else {
		getInitialBattleConfig(function(data) {
			boardConfig = data;
			func();
		});
	}
	
	
}

var boardConfig = null;
var enemyConfig = null;

function getEnemyConfig(callback) {
//	var config = new Array();
//	var index = 0;
//	for(var i=0;i<9;i++) {
//		config[index] = {
//			'position': String.fromCharCode(i+65) + '8',
//			'state': 'active'
//		}
//		index++;
//	}
//	for(var i=0;i<9;i++) {
//		config[index] = {
//			'position': String.fromCharCode(i+65) + '7',
//			'state': 'active'
//		}
//		index++;
//	}
//	for(var i=0;i<3;i++) {
//		config[index] = {
//			'position': String.fromCharCode(i+65) + '6',
//			'state': 'active'
//		}
//		index++;
//	}
//	enemyConfig = config;
	
	expiringCall('enemy_info',timeout, function(data) {
		enemyConfig = data;
		callback('Succeeded');
		
	}, function() {
		callback('Failed');
	})
	
}

function startBattle(challenger,callback) {
	getInitialBattleConfig(function(data) {
		boardConfig = data;
		var battleInfo = {
				'username': authData.username,
				'password': authData.password,
				'challenger': challenger
		}
		socket.emit('prepare_battle',battleInfo);
		expiringCall('prepare_battle_res',timeout, function(data) {
			callback(data.response);
		}, function() {
			callback('Timeout');
		})
	});
}