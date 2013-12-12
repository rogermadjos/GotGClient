
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
		$("#boardconfigback #save").off('click').click(function() {
			
		});
	}
	else {
		$("#bcname").val('');
		$("#bcname").removeAttr('readonly');
	}
}
