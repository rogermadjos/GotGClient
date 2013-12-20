
var pieceImageNames = 
[
	"flag.png",
	"spy.png",
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
];

var pieceNumbers = [1,2,1,1,1,1,1,1,1,1,1,1,1,1,6];

var dirImg = ["right.png","left.png","up.png","down.png"];

function initGamescript() {
//	$("#leftarrow").mousedown(function() {
//		$(this).attr('src','images/left-active.png');
//	});
//
//	$("#leftarrow").mouseup(function() {
//		$(this).attr('src','images/left.png');
//	})
//
//	$("#rightarrow").mousedown(function() {
//		$(this).attr('src','images/right-active.png');
//	});
//
//	$("#rightarrow").mouseup(function() {
//		$(this).attr('src','images/right.png');
//	})
}

function startBCEdit(bconfig) {
	var currentPool = 0;
	var width = $("#boardconfigform").width();
	var cellwidth = Math.floor(width/9);
	var cellheight = Math.floor(width/11);
	var index = 0;
	var pieces = new Array();
	var fromPool = true;
	var lastTile = null;
	for(var i=0;i<pieceImageNames.length;i++) {
		for(var j=0;j<pieceNumbers[i];j++) {
			pieces[index++] = pieceImageNames[i];
		}
	}
	$(".tile").html('');
	var setPool = function(num) {
		$(".highlight").remove();
		if(num < 0) {
			num = pieces.length-1;
		}
		if(num >= pieces.length) {
			num = 0;
		}
		currentPool = num;
		$("#pool").html("<div><img class='fadein' src='images/"+pieces[num]+"' height='78px' style='margin-bottom:-3px;width: 98%;'</img></div>");
	}
	setPool(currentPool);
	$("#pool").off('click').click(function() {
		if($(this).html()!='') {
			fromPool = true;
			if($("#pool").has(".highlight").length == 0) {
				$("#pool").append("<div style='margin-top:-80px' class='highlight'><img class='fadein' src='images/highlight.png' height='79px' style='margin-bottom:-3px;width: 98%;'</img></div>");
				$("#boardconfigback .tile").each(function() {
					if($(this).html()=='') {
						$(this).html("<div class='highlight'><img class='fadein' src='images/highlight2.png' height='"+(cellheight-3)+"' style='margin-bottom:-3px;width: 98%;'</img></div>");
					}
				})
				
			}
			$(".highlightin").remove();
			lastTile = null;
		}
	});
	$("#bceditor .tile").off('click').click(function() {
		if($(this).has(".highlight").length > 0 && fromPool) {
			$(this).html("<div class='piece'><img src='images/"+pieces[currentPool]+"' height="+(cellheight-3)+"><div>");
			$(".highlight").remove();
			pieces.splice(currentPool,1);
			currentPool--;
			if(pieces.length > 0) {
				$("#boardconfigform #rightarrow").mousedown();
			}
			else {
				$("#pool").html('');
			}
			lastTile = null;
		}
		else if($(this).has(".highlight").length > 0 && !fromPool) {
			$(".highlightin").remove();
			$(this).html(lastTile.html());
			lastTile.html('');
			$(".highlight").remove();
			lastTile = null;
		}
		else if($(this).has("div").length > 0){
			if(lastTile==null) {
				fromPool = false;
				lastTile = $(this);
				$(".highlightin").remove();
				$("#pool .highlight").remove();
				$(this).append("<div class='highlightin' style='margin-top:-"+(cellheight-3)+"px'><img class='fadein' src='images/highlight.png' height='"+(cellheight-4)+"' style='margin-bottom:-3px;width: 98%;'</img></div>");
				$("#boardconfigback .tile").each(function() {
					if($(this).html()=='') {
						$(this).html("<div class='highlight'><img class='fadein' src='images/highlight2.png' height='"+(cellheight-3)+"' style='margin-bottom:-3px;width: 98%;'</img></div>");
					}
				})
			}
			else {
				$(".highlightin").remove();
				$(".highlight").remove();
				var html = lastTile.html();
				lastTile.html($(this).html());
				$(this).html(html);
				lastTile = null;
			}
		}
	});
	$("#boardconfigback #save").off('click').click(function() {
		$(".highlightin").remove();
		$(".highlight").remove();
		var bcname = $("#bcname").val();
		if(bcname==null || bcname=='') {
			showMessageDialog({
				title: "Board Configuration",
				content: "Name field must not be empty.",
				callback: function(){
					showComponent("boardconfigform");
					showComponent("boardconfigback");
					showComponent("backbutton");
				}
			});
		}
		else if(pieces.length > 0) {
			showMessageDialog({
				title: "Board Configuration",
				content: "All pieces must be placed on the game board.",
				callback: function(){
					showComponent("boardconfigform");
					showComponent("boardconfigback");
					showComponent("backbutton");
				}
			});
		}
		else {
			var index = 0;
			var bc = '';
			$("#bceditor .tile").each(function() {
				if($(this).html()!='') {
					var image = $(this).find("div img").attr('src').substring(7);
					var rank = pieceImageNames.indexOf(image);
					var rankS = '';
					if(rank < 10) {
						rankS = '0'+rank;
					}
					else {
						rankS = '' + rank;
					}
					bc = bc + $(this).attr('id')+'-'+rankS+';';
					index++;
				}
			})
			var data = {
				'bconfig':bc,
				'name':bcname,
				'username':environment.authData.username,
				'password':environment.authData.password
			}
			if(bconfig!=null) {
				data.bconfigid = bconfig.bconfigid;
			}
			showWaitDialog({content:"Saving board configuration . . . ."});
			volatileCall('saveboardconfig','saveboardconfig_res',data,function(res) {
				if(res != 'Success') {
					showMessageDialog({
						title: "Error",
						content: "An error has occured while saving board configuration.",
						callback: function(){
							showComponent("boardconfigform");
							showComponent("boardconfigback");
							showComponent("backbutton");
						}
					});
				}
				else {
					showMessageDialog({
						title: "Board Configuration",
						content: "Board configuration is saved successfully.",
						callback: function(){
							showComponent("boardconfigform");
							showComponent("boardconfigback");
							showComponent("backbutton");
							$('#backbutton').click();
						}
					});
				}
			},function(){
				showMessageDialog({
					title: "Error",
					content: "Failed to connect to server. Cannot save board configuration.",
					callback: function(){
						showComponent("boardconfigform");
						showComponent("boardconfigback");
						showComponent("backbutton");
					}
				});
			});
		}
	})
	$("#boardconfigform #leftarrow").off('mousedown').mousedown(function() {
		if(pieces.length > 0) {
			setPool(currentPool - 1);
		}
	});
	$("#boardconfigform #rightarrow").off('mousedown').mousedown(function() {
		if(pieces.length > 0) {
			setPool(currentPool + 1);
		}
	});
	
	if(bconfig!=null) {
		$("#bcname").val(bconfig.bconfigname);
		$("#bcname").attr('readonly','readonly');
		pieces = new Array();
		$("#pool").html('');
		for(var i=0;i<21;i++) {
			var info = bconfig.bconfig.substr(i*7,6);
			var tile = info.substr(0,3);
			var rank = parseInt(info.substr(4,2));
			$("#boardconfigback #"+tile).html("<div class='piece'><img src='images/"+pieceImageNames[rank]+"' height="+(cellheight-3)+"><div>");
		}
	}
	else {
		$("#bcname").val('');
		$("#bcname").removeAttr('readonly');
	}
}

function battle() {
	var turn = false;
	showWaitDialog({content:"Preparing battle requirements . . . ."});
	environment.socket.once('testconnect',function() {
		environment.socket.emit('testconnect_res',environment.authData.username);
	});
	environment.socket.once('battlestart',function(data) {
		environment.socket.removeAllListeners('turnsignal');
		environment.socket.removeAllListeners('battlereport');
		hideComponent("waitdialog");
		var width = $(window).width();
		var cellwidth = Math.floor(width/9);
		var cellheight = Math.floor(width/11);
		
		var html = "";
		html +="<table border=1 cellpadding=0 style='table-layout:fixed'>";
		for(var i=0;i<8;i++) {
			html +="<tr height="+cellheight+">";
			var c = 'homebase';
			if(i==3 || i==4) {
				c = 'battlezone';
			}
			for(var j=0;j<9;j++) {
				html +="<td class='tile "+c+"' width="+cellwidth+" id="+j+"-"+(7-i)+">";
				html +="</td>";
			}
			html +="</tr>";
		}
		html +="</table>";
		$("#gameboard").html(html);
		
		var bconfig = data.bconfig;
		
		for(var i=0;i<bconfig.length;i++) {
			$("#gameboard #"+bconfig[i].tile).html("<div class='piece' number="+i+" ><img src='images/"+pieceImageNames[bconfig[i].rank]+"' height="+(cellheight-3)+"><div>")
		}
		for(var i=0;i<data.enemybconfig.length;i++) {
			var tile = data.enemybconfig[i];
			var x = 8-parseInt(tile.substr(0,1));
			var y = 7-parseInt(tile.substr(2,1));
			$("#gameboard #"+x+'-'+y).html("<div class='enemypiece'><img src='images/enemy.png' height="+(cellheight-3)+"><div>");
		}
		var selected = "";

		$("#gameboard .tile").off('click').click(function() {
			if(!turn) {
				return;
			}
			if($(this).has(".piece").length > 0) {
				$("#gameboard .highlight").remove();
				$("#gameboard .arrow").remove();
				$("#gameboard .move").remove();
				var tile = $(this).attr('id');
				selected = tile;
				var x = parseInt(tile.substr(0,1));
				var y = parseInt(tile.substr(2,1));
				var validm = new Array();
				var index = 0;
				if(y+1<8) {
					var move = new Object();
					move.dir = 'up';
					move.coor = x+'-'+(y+1);
					validm[index++] = move;
				}
				if(y-1>=0) {
					var move = new Object();
					move.dir = 'down';
					move.coor = x+'-'+(y-1);
					validm[index++] = move;
				}
				if(x+1<9) {
					var move = new Object();
					move.dir = 'right';
					move.coor = (x+1)+'-'+y;
					validm[index++] = move;
				}
				if(x-1>=0) {
					var move = new Object();
					move.dir = 'left';
					move.coor = (x-1)+'-'+y;
					validm[index++] = move;
				}
				for(var i=0;i<validm.length;i++) {
					if($("#gameboard #"+validm[i].coor).html() == '') {
						$("#gameboard #"+validm[i].coor).html("<div class='arrow fadein' move='"+validm[i].dir+"' ><img src='images/"+validm[i].dir+".png' height="+(cellheight-3)+"><div>");
					}
					else if($("#gameboard #"+validm[i].coor).has(".enemypiece").length > 0) {
						$("#gameboard #"+validm[i].coor).append("<div class='arrow fadein' move='"+validm[i].dir+"' style='margin-top:-"+(cellheight-3)+"px'><img src='images/"+validm[i].dir+".png' height='"+(cellheight-4)+"' style='margin-bottom:-3px;width: 98%;'</img></div>");
					}
				}
				$(this).append("<div class='highlight' style='margin-top:-"+(cellheight-3)+"px'><img class='fadein' src='images/highlight.png' height='"+(cellheight-4)+"' style='margin-bottom:-3px;width: 98%;'</img></div>");
			}
			else if($(this).has(".arrow").length > 0) {
				alert('arrow');
				var tile = $(this).attr('id');
				var data = {
					'number':$("#gameboard #"+selected+" div").attr('number'),
					'move':$("#"+tile+" .arrow").attr('move'),
					'newc':tile
				};
				var hasengagement = $(this).has(".enemypiece").length > 0;
				var html = $("#gameboard #"+selected).html();
				$(this).html(html);
				if(hasengagement) {
					$(this).append("<div class='engagement' style='margin-top:-"+(cellheight-3)+"px'><img src='images/engagement.png' height='"+(cellheight-4)+"' style='margin-bottom:-3px;width: 98%;'</img></div>");
				}
				bconfig[data.number].tile = tile;
				$("#gameboard .highlight").remove();
				$("#gameboard .arrow").remove();
				$("#gameboard #"+selected).html('');
				environment.socket.emit('turnreturn',data);
				turn = false;
			}
			else {
				alert('none');
				$("#gameboard .highlight").remove();
				$("#gameboard .arrow").remove();
			}
			var tile = $(this).attr('id');
		});
		showComponent("battlefield");
		environment.socket.on('turnsignal',function(data) {
			turn = true;
			if(data!=null) {
				var x = 8 - parseInt(data.from.substr(0,1));
				var y = 7 - parseInt(data.from.substr(2,1));
				var html = $("#gameboard #"+x+"-"+y).html();
				$("#gameboard #"+x+"-"+y).html('');
				var trans = ['up','down','left','right'];
				var transs = ['down','up','right','left'];
				$("#gameboard #"+x+"-"+y).html("<div class='move fadein' ><img src='images/"+transs[trans.indexOf(data.move)]+"-move.png' height="+(cellheight-3)+"><div>");
				x = 8 - parseInt(data.to.substr(0,1));
				y = 7 - parseInt(data.to.substr(2,1));
				console.log(data.result);
				if(data.result == 'win') {
					
				}
				else if(data.result == 'draw') {
					$("#gameboard #"+x+"-"+y).html('');
				}
				else {
					$("#gameboard #"+x+"-"+y).html(html);
				}
			}
		});
		environment.socket.on('battlereport',function(data) {
			$("#gameboard .engagement").remove();
			environment.socket.emit('battlereportack');
			console.log(data.result);
			if(data.result == 'lose') {
				var tile = bconfig[data.number].tile;
				$("#gameboard #"+tile).html("<div class='enemypiece'><img src='images/enemy.png' height="+(cellheight-3)+"><div>");
			}
			else if(data.result == 'draw') {
				var tile = bconfig[data.number].tile;
				$("#gameboard #"+tile).html("");
			}
		});
	});
}
