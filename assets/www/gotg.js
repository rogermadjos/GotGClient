$.fn.pressEnter = function(fn) {  

    return this.each(function() {  
        $(this).bind('enterPress', fn);
        $(this).keyup(function(e){
            if(e.keyCode == 13)
            {
              $(this).trigger("enterPress");
            }
        })
    });  
};


$.getScript = function(url, callback){
	$.ajax({
		type: "GET",
		url: url,
		success: callback,
		dataType: "script",
		cache: true,
		async: true
  	});
};

$.fn.restrict = function( chars ) {
    return this.keydown(function(e) {
        var found = false;
        for(var i=0;i<chars.length;i++) {
            found = found || chars[i]+"" == String.fromCharCode(e.which);
        }
        if(found) {
        	e.preventDefault();
        }
    });
};

 
var server_url = "http://192.168.1.3:8050";
//var server_url = "http://54.254.185.73:8050";
var socket;
var timeout = 30000;
var authData;
var idle = true;

$(document).ready(function() {
    window.isphone = false;
    
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
    	window.isphone = true;
	}

    if(window.isphone) {
    	$.getScript("cordova.js",function() {
    		document.addEventListener("deviceready", init, true);
    	});
    }
    else {
    	$.getScript("./jquery.cookie/jquery.cookie.js",function() {
    		init();
    	});
    }
    
});
 
function init() {
	
	setTimeout(initConnection,200);
}

function fail(error) {
    console.log(error.code);
}

function getUserData(handler) {
	var data = {
			'username':undefined,
			'password':undefined
	};
	if(!window.isphone) {
		data.username = $.cookie("gotg_username");
		data.password = $.cookie("gotg_password");
		handler(data);
	}
	else {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			var entry=fileSystem.root; 
		    entry.getDirectory("GotG", {create: true, exclusive: false}, function(dir) {
		    	dir.getFile("userdata.txt", {create: true, exclusive: false}, function(fileEntry) {
		    		fileEntry.file(function(file) {
		    	        var reader = new FileReader();
		    	        var start = false;
		    	        reader.onloadend = function(evt) {
		    	        	if(start) {
		    	        		var res = evt.target.result.split('\n');
			    	        	if(res.length == 2) {
			    	        		data.username = res[0];
				    	        	data.password = res[1];
			    	        	}
			    	        	handler(data);
		    	        	}
		    	        };
		    	        start = true;
		    	        reader.readAsText(file);
		    		},fail);
		    	}, fail);
		    }, fail);
		},fail);
	}
}

function clearUserData(callback) {
	if(!window.isphone) {
		$.removeCookie('gotg_username');
		$.removeCookie('gotg_password');
		callback();
	}
	else {
		var handler = function() {
			callback();
		};
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			var entry=fileSystem.root; 
		    entry.getDirectory("GotG", {create: true, exclusive: false}, function(dir) {
		    	dir.getFile("userdata.txt", {create: true, exclusive: false}, function(fileEntry) {
		    		fileEntry.remove(handler,handler);
		    	}, fail);
		    }, fail);
		},fail);
	}
}

function saveUserData(username,password,callback) {
	if(!window.isphone) {
		$.cookie('gotg_username',username);
		$.cookie('gotg_password',password);
		callback();
	}
	else {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			var entry = fileSystem.root; 
		    entry.getDirectory("GotG", {create: true, exclusive: false}, function(dir) {
		    	dir.getFile("userdata.txt", {create: true, exclusive: false}, function(fileEntry) {
		    		fileEntry.createWriter(function(writer) {
		    			writer.write(username+'\n'+password);
		    			callback();
		    		},fail);
		    	}, fail);
		    }, fail);
		},fail);
	}
}

function initConnection() {
	prepare();
	var loaded = false;
	$("#loginform").css("display","none");
	$("#loginform").removeClass("fadein");
	setTimeout(function() {
		if(!loaded) {
			$("#wait").removeClass("fadein");
			$("#wait").css("display","none");
			$("#errorcontent").html("Cannot connect to server.");
			$("#errorconnect").css("display","block");
			$("#errorconnect").addClass("fadein");
			$("#retry").off('click').click(function() {
				$("#errorconnect").removeClass("fadein");
				$("#errorconnect").css("display","none");
				$("#waitcontent").html("Connecting to server . . . .");
				$("#wait").css("display","block");
				$("#wait").addClass("fadein");
				initConnection();
			});
		}
		
	},timeout);
	$.getScript(server_url+"/socket.io/socket.io.js", function(){
		loaded = true;
		socket = io.connect(server_url);
		getUserData(function(userdata) {
			if(userdata.username==undefined || userdata.password==undefined) {
				$("#wait").removeClass("fadein");
				$("#wait").css("display","none");
				$("#loginform").css("display","block");
				$("#loginform").addClass("fadein");
			}
			else {
				login(userdata.username,userdata.password);
			}
		});
	});
}

function login(username,password) {
	$("#waitcontent").html("Logging in . . . .");
	$("#wait").css("display","block");
	$("#wait").addClass("fadein");
	var data = {
			'username':username,
			'password':password
	};
	socket.emit('login', data);
	
	var handler = function(data) {
		$("#wait").removeClass("fadein");
		$("#wait").css("display","none");
		socket.removeListener('login_res', handler);
		if(data.response=="Valid") {
			
			saveUserData(username,password,function() {
				$("#lobby").css("display","block");
				$("#lobby").addClass("fadein");
				authData = {
						'username':username,
						'password':password
				};
			});
			socket.on('check_online',function() {
				socket.emit('check_online_res');
			});
			
			socket.on('get_battle_config',function() {
				console.log('get battle config');
				if(boardConfig==null) {
					getInitialBattleConfig(function(data) {
						boardConfig = data;
						socket.emit('get_battle_config_res',data);
					});
				}
				else {
					socket.emit('get_battle_config_res',boardConfig);
				}
			});
			
			socket.on('challenge_accepted',function(data) {
				
				console.log('challenge');
				
				$("#battleinvitationsform").css("display","none");
				$("#battleinvitationsform").removeClass("fadein");
				
				$("#battlechallengersform").css("display","none");
				$("#battlechallengersform").removeClass("fadein");
				
				$("#account").css("display","none");
				$("#account").removeClass("fadein");
				
				$("#gameroom").css("display","none");
				$("#gameroom").removeClass("fadein");
				
				$("#lobby").css("display","none");
				$("#lobby").removeClass("fadein");
				
				$("#tbdialog").css("display","none");
				$("#tbdialog").removeClass("fadein");
				
				$("#errorconnect").css("display","none");
				$("#errorconnect").removeClass("fadein");
				
				$("#dialog").css("display","none");
				$("#dialog").removeClass("fadein");
				
				$("#backbutton").css("visibility","hidden");
				$("#backbutton").css("opacity","0");
				
				var func = function() {
					$("#tbdialogtitle").html("Battle");
					$("#tbdialogcontent").html("<span class='fontclass6'>"+data.opponent+"</span> has accepted your challenge.");
					$("#tbdialog").css("display","block");
					$("#tbdialog").addClass("fadein");
					$("#tbbuttonone").html("Start");
					$("#tbbuttontwo").html("Cancel");
					$("#tbbuttonone").button('refresh');
					$("#tbbuttontwo").button('refresh');
					$("#tbbuttonone").click(function() {
						
						$("#tbdialog").css("display","none");
						$("#tbdialog").removeClass("fadein");
						
						$("#waitcontent").html("Waiting for server . . . .");
						$("#wait").css("display","block");
						$("#wait").addClass("fadein");
						
						socket.emit('battle_decide','start');
						expiringCall('battle_engage',timeout, function(res) {
							$("#wait").removeClass("fadein");
							$("#wait").css("display","none");
							//start
							console.log('Battle starting');
							
							prepareBoard();
							
						}, function() {
							$("#wait").removeClass("fadein");
							$("#wait").css("display","none");
							$("#errorcontent").html("Error has occured. Battle is aborted.");
							$("#errorconnect").css("display","block");
							$("#errorconnect").addClass("fadein");
							$("#retry").off('click').click(function() {
								$("#errorconnect").removeClass("fadein");
								$("#errorconnect").css("display","none");

								$("#lobby").css("display","block");
								$("#lobby").addClass("fadein");
								
							});
						})

					})
					$("#tbbuttontwo").click(function() {
						$("#tbdialog").css("display","none");
						$("#tbdialog").removeClass("fadein");
						
						$("#lobby").css("display","block");
						$("#lobby").addClass("fadein");
						
						socket.emit('battle_decide','cancel');
					})
				}
				
				if(idle) {
					func();
				}
				else {
					console.log('here');
					var interval = setInterval(function() {
						if(idle) {
							clearInterval(interval);
							func();
						}
					},500);
				}
			});
		}
		else {
			$("#dialogtitle").html("Log In");
			$("#dialogcontent").html("Invalid username or password.");
			$("#dialog").css("display","block");
			$("#dialog").addClass("fadein");
			$("#ok").off('click').click(function() {
				$("#signupform").removeClass("fadein");
				$("#signupform").css("display","none");
				$("#dialog").removeClass("fadein");
				$("#dialog").css("display","none");
				$("#loginform").css("display","block");
				$("#loginform").addClass("fadein");
			});
		}
	};
	var timeoutHandler = function() {
		socket.removeListener('login_res', handler);

		$("#wait").removeClass("fadein");
		$("#wait").css("display","none");
		$("#errorcontent").html("Cannot connect to server.");
		$("#errorconnect").css("display","block");
		$("#errorconnect").addClass("fadein");
		$("#retry").off('click').click(function() {
			$("#errorconnect").removeClass("fadein");
			$("#errorconnect").css("display","none");
			$("#loginform").css("display","block");
			$("#loginform").addClass("fadein");
		});
	}
	expiringCall('login_res',timeout, handler, timeoutHandler);
}

function prepare() {
	function paddy(n, p, c) {
	    var pad_char = typeof c !== 'undefined' ? c : '0';
	    var pad = new Array(1 + p).join(pad_char);
	    return (pad + n).slice(-pad.length);
	}
	
	var resizeEventHandler = function() {
		var height = $(window).height();
		$("#invitationslistview").height(height-420);
		$("#challengerslistview").height(height-365);
	};
	
	resizeEventHandler();
	
	$(window).resize(resizeEventHandler);
	
	
	$("#gamebutton").off('click').click(function() {
		
		$("#challengerslistview").listview();
		
		$("#lobby").css("display","none");
		$("#lobby").removeClass("fadein");
		
		$("#tbdialog").css("display","none");
		$("#tbdialog").removeClass("fadein");
		
		$("#gameroomcontents").css("display","block");
		$("#gameroomcontents").addClass("fadein");
		
		$("#gameroom").css("display","block");
		$("#gameroom").addClass("fadein");
		$("#backbutton").css("visibility","visible");
		$("#backbutton").addClass("fadein");
		
		socket.emit('onetime_update_battleinvitations');
		socket.emit('getchallengedata',authData);
		
		socket.emit('startupdate_battleinvitations');
		socket.emit('startupdate_challengers',authData);
		var biHandler = function(data) {
			var html = "";
			var inlist = false;
			for(var i=0;i<data.battleinvitations.length;i++) {
				html = html + "<li data-theme='a'><a class='inv' data-role='button'><span class='usernameinfo'>"+data.battleinvitations[i].username+"</span><span class='ui-li-count'>"+paddy(Math.round(data.battleinvitations[i].score),6)+"</span></a></li>";
				inlist = inlist || data.battleinvitations[i].username == authData.username;
			}
			socket.emit('getchallengedata',authData);
			var handler = function() {
				
				if($(this).hasClass('challenged')) {
					var user = $(this).find(".usernameinfo").html();
					
					$("#gameroomcontents").css("display","none");
					$("#gameroomcontents").removeClass("fadein");
					
					$("#tbdialogtitle").html("Challenge");
					var htmlV = "Cancel batle challenge.";
					$("#tbdialogcontent").html(htmlV);
					$("#tbdialog").css("display","block");
					$("#tbdialog").addClass("fadein");
					$("#tbbuttonone").html('Continue');
					$("#tbbuttontwo").html('Cancel');
					$("#tbbuttonone").button('refresh');
					$("#tbbuttontwo").button('refresh');
					$("#tbbuttonone").off('click').click(function() {
						$("#tbdialog").css("display","none");
						$("#tbdialog").removeClass("fadein");
						
						$("#gameroomcontents").css("display","block");
						$("#gameroomcontents").addClass("fadein");
						
						var cancelCData = {
								'username':authData.username,
								'password':authData.password,
								'opponent':user
						}
						
						console.log(authData);
						socket.emit('cancelchallenge',cancelCData);
						
						socket.emit('getchallengedata',authData);
					});
					$("#tbbuttontwo").off('click').click(function() {
						$("#tbdialog").css("display","none");
						$("#tbdialog").removeClass("fadein");
						
						$("#gameroomcontents").css("display","block");
						$("#gameroomcontents").addClass("fadein");
					});
				}
				else {
					var username = $(this).find(".usernameinfo").html();
					if(!(authData.username == username)) {
						$("#gameroomcontents").css("display","none");
						$("#gameroomcontents").removeClass("fadein");
						
						$("#tbdialogtitle").html("Challenge");
						var htmlV = "<table>" +
								"<tr>" +
								"<td width=100><span class='fontclass5'>Challenger</span></td>" +
								"<td>"+authData.username+"</td>" +
								"</tr>" +
								"<tr>" +
								"<td><span class='fontclass6'>Opponent</span></td>" +
								"<td>"+username+"</td>" +
								"</tr>" +
								"</table>";
						$("#tbdialogcontent").html(htmlV);
						$("#tbdialog").css("display","block");
						$("#tbdialog").addClass("fadein");
						$("#tbbuttonone").html('Challenge');
						$("#tbbuttontwo").html('Cancel');
						$("#tbbuttonone").button('refresh');
						$("#tbbuttontwo").button('refresh');
						$("#tbbuttonone").off('click').click(function() {
							console.log('challenging');
							var challengeData = {
									'username':authData.username,
									'password':authData.password,
									'opponent':username
							};
							socket.emit('challenge',challengeData);
							var handler = function(data) {
								socket.removeListener('challenge_res', handler);
								if(data.response=='Success') {
									socket.emit('getchallengedata',authData);
									$("#tbdialog").css("display","none");
									$("#tbdialog").removeClass("fadein");
									
									$("#gameroomcontents").css("display","block");
									$("#gameroomcontents").addClass("fadein");
								}
								else {
									$("#tbdialog").css("display","none");
									$("#tbdialog").removeClass("fadein");
									
									$("#gameroomcontents").css("display","block");
									$("#gameroomcontents").addClass("fadein");
								}

							};
							var timeoutHandler = function() {
								
								$("#tbdialog").css("display","none");
								$("#tbdialog").removeClass("fadein");
								
								$("#gameroomcontents").css("display","block");
								$("#gameroomcontents").addClass("fadein");
							}
							expiringCall('challenge_res',timeout, handler, timeoutHandler)
						});
						$("#tbbuttontwo").off('click').click(function() {
							$("#tbdialog").css("display","none");
							$("#tbdialog").removeClass("fadein");
							
							$("#gameroomcontents").css("display","block");
							$("#gameroomcontents").addClass("fadein");
						});
					}
				}
			};
			$("body").off('click','.inv').on('click','.inv',handler);
			
			$("#battleinvitationslistview").html(html);
			$("#battleinvitationslistview").listview('refresh');
			
			if(inlist) {
				$("#postbattleinvitation").removeClass("post");
				$("#postbattleinvitation").removeClass("posting");
				$("#postbattleinvitation").addClass("posted");
				$("#postbattleinvitation").html("<span>Cancel Battle Invitation</span>");
				$("#postbattleinvitation").button("refresh");
			}
		};
		
		socket.on('startupdate_battleinvitations_res',biHandler);
		
		var gcdHandler = function(data) {
			var opponents = new Array();
			if(data.data != null) {
				for(var i=0;i<data.data.length;i++) {
					opponents[i] = data.data[i].username;
				}
			}
			$("#battleinvitationslistview").find('li').each(function() {
				var op = $(this).find(".usernameinfo").html();
				
				if(opponents.indexOf(op) >= 0) {
					console.log(op +" Challenged");
					$(this).attr('data-theme','c').trigger('mouseout');
					$(this).find(".inv").addClass('challenged');
				}
				else {
					
					$(this).removeAttr('data-theme').removeClass("ui-btn-up-c").addClass("ui-btn-up-a").trigger('mouseout');
					$(this).find(".inv").removeClass('challenged');
				}
			});
			$("#battleinvitationslistview").listview('refresh');
		}
		socket.on('getchallengedata_res',gcdHandler);
		
		var cHandler = function(data) {
			var challengers = new Array();
			if(data.data != null) {
				for(var i=0;i<data.data.length;i++) {
					challengers[i] = {
							'username':data.data[i].username,
							'score':data.data[i].score
					}
				}
			}
			html = "";
			console.log(data);
			for(var i=0;i<challengers.length;i++) {
				console.log(challengers[i].username+" "+challengers[i].score);
				html = html + "<li data-theme='a'><a class='chal' data-role='button'><span class='challengerinfo'>"+challengers[i].username+"</span><span class='ui-li-count'>"+paddy(Math.round(challengers[i].score),6)+"</span></a></li>";
			}
			var handler = function() {
				var user = $(this).find(".challengerinfo").html();
				
				$("#gameroomcontents").css("display","none");
				$("#gameroomcontents").removeClass("fadein");
				
				$("#tbdialogtitle").html("Challenge");
				var htmlV = "You are about to accept the challenge of <span class='fontclass6'>"+user+"</span>.";
				$("#tbdialogcontent").html(htmlV);
				$("#tbdialog").css("display","block");
				$("#tbdialog").addClass("fadein");
				$("#tbbuttonone").html('Continue');
				$("#tbbuttontwo").html('Cancel');
				$("#tbbuttonone").button('refresh');
				$("#tbbuttontwo").button('refresh');
				$("#tbbuttonone").off('click').click(function() {
					$("#tbdialog").css("display","none");
					$("#tbdialog").removeClass("fadein");
					
					$("#waitcontent").html("Preparing battle requirements . . . .");
					$("#wait").css("display","block");
					$("#wait").addClass("fadein");
					
					$("#backbutton").css("visibility","hidden");
					$("#backbutton").css("opacity","0");
					
					startBattle(user, function(res) {
						console.log(res);
						if(res == 'Failed') {
							$("#wait").removeClass("fadein");
							$("#wait").css("display","none");
							$("#errorcontent").html("An error caused the battle preparations to be cancelled.");
							$("#errorconnect").css("display","block");
							$("#errorconnect").addClass("fadein");
							$("#retry").off('click').click(function() {
								$("#errorconnect").removeClass("fadein");
								$("#errorconnect").css("display","none");

								$("#gameroomcontents").css("display","block");
								$("#gameroomcontents").addClass("fadein");
							});
						}
						else if(res == 'Succeeded') {
							$("#waitcontent").html("Waiting for <span class='fontclass6'>"+user+"</span> . . . .");
							expiringCall('battle_engage',timeout, function(res) {
								if(res == 'commence') {
									$("#wait").removeClass("fadein");
									$("#wait").css("display","none");
									
									$("#gameroom").removeClass("fadein");
									$("#gameroom").css("display","none");
									//start
									console.log('Battle starting');
									
									prepareBoard();
								}
								else {
									$("#wait").removeClass("fadein");
									$("#wait").css("display","none");
									$("#dialogtitle").html('Battle');
									$("#dialogcontent").html("<span class='fontclass6'>"+user+"</span> has aborted the battle.");
									$("#dialog").css("display","block");
									$("#dialog").addClass("fadein");
									$("#ok").off('click').click(function() {
										$("#dialog").removeClass("fadein");
										$("#dialog").css("display","none");

										$("#gameroomcontents").css("display","block");
										$("#gameroomcontents").addClass("fadein");
										
										$("#backbutton").css("visibility","visible");
										$("#backbutton").css("opacity","1");
									});
								}
							}, function() {
								$("#wait").removeClass("fadein");
								$("#wait").css("display","none");
								$("#errorcontent").html("<span class='fontclass6'>"+user+"</span> has not responded. Battle is aborted.");
								$("#errorconnect").css("display","block");
								$("#errorconnect").addClass("fadein");
								$("#retry").off('click').click(function() {
									$("#errorconnect").removeClass("fadein");
									$("#errorconnect").css("display","none");

									$("#gameroomcontents").css("display","block");
									$("#gameroomcontents").addClass("fadein");
								});
							});
						}
						else {
							
						}
					});
				});
				$("#tbbuttontwo").off('click').click(function() {
					$("#tbdialog").css("display","none");
					$("#tbdialog").removeClass("fadein");
					
					$("#gameroomcontents").css("display","block");
					$("#gameroomcontents").addClass("fadein");
				});
			}
			
			$("body").off('click','.chal').on('click','.chal',handler);

			$("#challengerslistview").html(html);
			
			$("#challengerslistview").listview('refresh');
			
		}
		socket.on('startupdate_challengers_res',cHandler);
		
		$("#postbattleinvitation").click(function() {
			if($("#postbattleinvitation").hasClass("post")) {
				$("#postbattleinvitation").removeClass("posted");
				$("#postbattleinvitation").removeClass("post");
				$("#postbattleinvitation").addClass("posting");
				$("#postbattleinvitation").html("<img src='images/ajax-loader.gif' style='opacity:0.3;width:20px;height:15px;'>");
				$("#postbattleinvitation").button("refresh");
				socket.emit('post_battleinvitation',authData);
				var handler = function(data) {
					socket.removeListener('post_battleinvitation_res', handler);
					if(data.response=='Success') {
						socket.emit('onetime_update_battleinvitations');
						$("#postbattleinvitation").removeClass("posting");
						$("#postbattleinvitation").addClass("posted");
						$("#postbattleinvitation").html("<span>Cancel Battle Invitation</span>");
						$("#postbattleinvitation").button("refresh");
					}
					else {
						$("#postbattleinvitation").removeClass("posted");
						$("#postbattleinvitation").removeClass("posting");
						$("#postbattleinvitation").addClass("post");
						$("#postbattleinvitation").html("<span>Post Battle Invitation</span>");
						$("#postbattleinvitation").button("refresh");
					}
				};
				var timeoutHandler = function() {
					socket.removeListener('post_battleinvitation_res', handler);
					$("#postbattleinvitation").removeClass("posted");
					$("#postbattleinvitation").removeClass("posting");
					$("#postbattleinvitation").addClass("post");
					$("#postbattleinvitation").html("<span>Post Battle Invitation</span>");
					$("#postbattleinvitation").button("refresh");
				}
				expiringCall('post_battleinvitation_res',timeout, handler, timeoutHandler)
			}
			else if($("#postbattleinvitation").hasClass("posted")) {
				$("#postbattleinvitation").removeClass("posted");
				$("#postbattleinvitation").removeClass("post");
				$("#postbattleinvitation").addClass("posting");
				$("#postbattleinvitation").html("<img src='images/ajax-loader.gif' style='opacity:0.3;width:20px;height:15px;'>");
				socket.emit('cancel_battleinvitation',authData);
				var handler = function(data) {
					$("#postbattleinvitation").removeClass("posted");
					$("#postbattleinvitation").removeClass("posting");
					$("#postbattleinvitation").addClass("post");
					$("#postbattleinvitation").html("<span>Post Battle Invitation</span>");
					$("#postbattleinvitation").button("refresh");
					socket.emit('onetime_update_battleinvitations');
				}
				var timeoutHandler = function() {
					socket.removeListener('cancel_battleinvitation_res', handler);
					$("#postbattleinvitation").removeClass("posted");
					$("#postbattleinvitation").removeClass("posting");
					$("#postbattleinvitation").addClass("post");
					$("#postbattleinvitation").html("<span>Post Battle Invitation</span>");
					$("#postbattleinvitation").button("refresh");
				}
				expiringCall('cancel_battleinvitation_res',timeout, handler, timeoutHandler)
			}
		});
		
		$("#battleinvitations").click(function() {
//			if(!$("#battleinvitations").hasClass("ui-btn-active")) {
				$("#battlechallengersform").css("display","none");
				$("#battlechallengersform").removeClass("fadein");
				$("#battleinvitationsform").css("display","block");
				$("#battleinvitationsform").addClass("fadein");
//			}
		});
		
		$("#battlechallengers").click(function() {
//			if(!$("#battlechallengers").hasClass("ui-btn-active")) {
				$("#battleinvitationsform").css("display","none");
				$("#battleinvitationsform").removeClass("fadein");
				$("#battlechallengersform").css("display","block");
				$("#battlechallengersform").addClass("fadein");
				
				
//			}
		});
		
		$("#battleinvitations").click();
		
		$("#backbutton").off('click').click(function() {
			socket.emit('stopupdate_battleinvitations');
			socket.emit('stopupdate_challengers');
			socket.removeListener('startupdate_battleinvitations_res', biHandler);
			socket.removeListener('getchallengedata_res', gcdHandler);
			socket.removeListener('startupdate_challengers_res', gcdHandler);
			
			$("#tbdialog").css("display","none");
			$("#tbdialog").removeClass("fadein");
			
			$("#gameroom").removeClass("fadein");
			$("#gameroom").css("display","none");
			$("#backbutton").css("visibility","hidden");
			$("#backbutton").css("opacity","0");
			$("#lobby").css("display","block");
			$("#lobby").addClass("fadein");
		});
	});
	
	$("#accountbutton").off('click').click(function() {
		$("#lobby").css("display","none");
		$("#lobby").removeClass("fadein");
		
		$("#waitcontent").html("Retrieving account information . . . .");
		$("#wait").css("display","block");
		$("#wait").addClass("fadein");

		socket.emit('retrieve', authData);
		
		var handler = function(data) {
			$("#wait").removeClass("fadein");
			$("#wait").css("display","none");
			if(data.response=="Valid") {
				$("#account").css("display","block");
				$("#account").addClass("fadein");
				$("#backbutton").css("visibility","visible");
				$("#backbutton").addClass("fadein");
				$("#account_email").val(data.email);
				$("#account_username").val(data.username);
				$("#account_npassword").val("");
				$("#account_cpassword").val("");
				$("#save").off('click').click(function() {
					if($("#account_email").val()!=data.email) {
						var res = validateEmail(data.email);
					}
					if($("#account_email").val()==data.email && $("#account_username").val()==data.username && $("#account_npassword").val()=="") {
						//do nothing
					}
					else {
						$("#waitcontent").html("Validating changes . . . .");
						$("#wait").css("display","block");
						$("#wait").addClass("fadein");
					}
				});
				$("#backbutton").off('click').click(function() {
					$("#account").removeClass("fadein");
					$("#account").css("display","none");
					$("#backbutton").css("visibility","hidden");
					$("#backbutton").css("opacity","0");
					$("#lobby").css("display","block");
					$("#lobby").addClass("fadein");
				});
			}
			else {
				$("#errorcontent").html("Unable to retrieve user information.");
				$("#errorconnect").css("display","block");
				$("#errorconnect").addClass("fadein");
				$("#retry").off('click').click(function() {
					$("#errorconnect").removeClass("fadein");
					$("#errorconnect").css("display","none");
					$("#lobby").css("display","block");
					$("#lobby").addClass("fadein");
				});
			}
		};
		var timeoutHandler = function() {
			$("#wait").removeClass("fadein");
			$("#wait").css("display","none");
			$("#errorcontent").html("Unable to retrieve user information.");
			$("#errorconnect").css("display","block");
			$("#errorconnect").addClass("fadein");
			$("#retry").off('click').click(function() {
				$("#errorconnect").removeClass("fadein");
				$("#errorconnect").css("display","none");
				$("#lobby").css("display","block");
				$("#lobby").addClass("fadein");
			});
		}
		expiringCall('retrieve_res',timeout, handler, timeoutHandler)
	});
	
	$("#logoutbutton").off('click').click(function() {
		clearUserData(function() {
			$("#usernamefield").val("");
			$("#passwordfield").val("");
			$("#lobby").css("display","none");
			$("#lobby").removeClass("fadein");
			$("#loginform").css("display","block");
			$("#loginform").addClass("fadein");
			
			document.location = "index.html";
		});
	});
	
	$("#signupbutton").off('click').click(function() {
		$("#backbutton").off('click').click(function() {
			$("#usernamefield").val("");
			$("#passwordfield").val("");
			$("#signupform").removeClass("fadein");
			$("#backbutton").removeClass("fadein");
			$("#signupform").css("display","none");
			$("#signupform").css("opacity","0");
			$("#backbutton").css("visibility","hidden");
			$("#backbutton").css("opacity","0");
			$("#loginform").css("display","block");
			$("#loginform").addClass("fadein");
		});
		
		$("#email").val("");
		$("#username").val("");
		$("#password").val("");
		$("#cpassword").val("");
		$("#loginform").removeClass("fadein");
		$("#loginform").css("display","none");
		$("#signupform").css("display","block");
		$("#signupform").addClass("fadein");
		$("#backbutton").css("visibility","visible");
		$("#backbutton").addClass("fadein");
		
		$('#email').restrict([' ']);
		$('#username').restrict([' ']);
		$('#password').restrict([' ']);
		$('#cpassword').restrict([' ']);
		
		$("#signup").off('click').click(function() {
			
			console.log('signup');
			
			var email = $("#email").val();
			var username = $("#username").val();
			var password = $("#password").val();
			var cpassword = $("#cpassword").val();
			var topass = false;
			$("#dialogtitle").html("Sign Up");
			if(email==""||username==""||password==""||cpassword=="") {
				$("#dialogcontent").html("Please fill up all the fields.");
			}
			else if(!validateEmail(email)) {
				$("#dialogcontent").html("Please enter a valid email address.");
			}
			else if(evaluatePassword(password)<3) {
				$("#dialogcontent").html("Password is not strong enough.");
			}
			else if(password!=cpassword) {
				$("#dialogcontent").html("The passwords do not match.");
			}
			else {
				topass = true;
			}
			if(!topass) {
				$("#signupform").removeClass("fadein");
				$("#backbutton").removeClass("fadein");
				$("#signupform").css("display","none");
				$("#signupform").css("opacity","0");
				$("#backbutton").css("visibility","hidden");
				$("#backbutton").css("opacity","0");
				$("#dialog").css("display","block");
				$("#dialog").addClass("fadein");
				$("#ok").off('click').click(function() {
					$("#dialog").removeClass("fadein");
					$("#dialog").css("display","none");
					$("#signupform").css("display","block");
					$("#signupform").addClass("fadein");
					$("#backbutton").css("visibility","visible");
					$("#backbutton").addClass("fadein");
				});
			}
			else {
				$("#waitcontent").html("Registering account . . . .");
				
				$("#signupform").removeClass("fadein");
				$("#backbutton").removeClass("fadein");
				$("#signupform").css("display","none");
				$("#signupform").css("opacity","0");
				$("#backbutton").css("visibility","hidden");
				$("#backbutton").css("opacity","0");
				$("#wait").css("display","block");
				$("#wait").addClass("fadein");
				
				var data = {
					'email': email,
					'username': username,
					'password': md5(password)
				}
				
				socket.emit('register', data);
				var handler = function(data) {
					$("#wait").removeClass("fadein");
					$("#wait").css("display","none");
					$("#dialogtitle").html("Sign Up");
					$("#dialogcontent").html(data.response);
					$("#dialog").css("display","block");
					$("#dialog").addClass("fadein");
					if(data.response=="Registration is successful.") {
						$("#ok").off('click').click(function() {
							$("#usernamefield").val(username);
							$("#passwordfield").val(password);
							$("#dialog").removeClass("fadein");
							$("#dialog").css("display","none");
							$("#signupform").removeClass("fadein");
							$("#signupform").css("display","none");
							$("#loginform").css("display","block");
							$("#loginform").addClass("fadein");
						});
					}
					else {
						$("#ok").off('click').click(function() {
							$("#dialog").removeClass("fadein");
							$("#dialog").css("display","none");
							$("#signupform").css("display","block");
							$("#signupform").addClass("fadein");
						});
					}
				};
				var timeoutHandler = function() {
					$("#wait").removeClass("fadein");
					$("#wait").css("display","none");
					$("#errorcontent").html("Cannot connect to server.");
					$("#errorconnect").css("display","block");
					$("#errorconnect").addClass("fadein");
					$("#retry").off('click').click(function() {
						$("#errorconnect").removeClass("fadein");
						$("#errorconnect").css("display","none");
						$("#signupform").css("display","block");
						$("#signupform").addClass("fadein");
						
					});
				}
				expiringCall('register_res',timeout, handler, timeoutHandler)
			}
		});
	});
	
	$('#usernamefield').restrict([' ']);
	$('#passwordfield').restrict([' ']);
	
	$("#loginbutton").off('click').click(function() {
		var username = $("#usernamefield").val();
		var password = $("#passwordfield").val();
		$("#loginform").removeClass("fadein");
		$("#loginform").css("display","none");
		if(username==""||password=="") {
			$("#dialogtitle").html("Log In");
			$("#dialogcontent").html("Please fill up all the fields.");
			$("#dialog").css("display","block");
			$("#dialog").addClass("fadein");
			$("#ok").off('click').click(function() {
				$("#signupform").removeClass("fadein");
				$("#signupform").css("display","none");
				$("#dialog").removeClass("fadein");
				$("#dialog").css("display","none");
				$("#loginform").css("display","block");
				$("#loginform").addClass("fadein");
			});
		}
		else {
			login(username,md5(password))
		}
	});
	
	
}

function evaluatePassword(password)
{
	var score = 1;

	if (password.length < 1)
		return 0;

	if (password.length < 4)
		return 1;

	if (password.length >= 8)
		score++;
	if (password.length >= 10)
		score++;
	if (password.match(/\d+/))
		score++;
	if (password.match(/[a-z]/) &&
		password.match(/[A-Z]/))
		score++;
	if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,£,(,)]/))
		score++;

	return score;
}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


