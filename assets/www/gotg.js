
var environment = new Object();
environment.server_url = "http://192.168.7.4:8050";
environment.socket = null;
environment.timeout = 10000;
environment.authData = null;

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
	$("#loginform #usernamefield").restrict(' ');
	$("#loginform #passwordfield").restrict(' ');
	$("#signupform #usernamefield").restrict(' ');
	$("#signupform #passwordfield").restrict(' ');
	$("#signupform #emailfield").restrict(' ');
	$("#signupform #cpasswordfield").restrict(' ');
	$("#loginbutton").off('click').click(function() {
		var username = $("#usernamefield").val();
		var password = $("#passwordfield").val();
		if(username==""&&password==""){}
		else if(username==""||password=="") {
			showMessageDialog({
				title: "Error",
				content: "Please fill up all the fields.",
				callback: function(){
					showComponent("loginform");
				}
			});
		}
		else {
			login({
				'username':username,
				'password':md5(password)
			});
		}
	});
	$("#signupbutton").off('click').click(function() {
		hideComponent("loginform");
		showComponent("signupform");
		showComponent("backbutton");
		$("#signupform #usernamefield").val('');
		$("#signupform #passwordfield").val('');
		$("#signupform #emailfield").val('');
		$("#signupform #cpasswordfield").val('');
		$("#backbutton").off('click').click(function() {
			hideComponent("signupform");
			showComponent("loginform");
			hideComponent("backbutton");
			$("#loginform #usernamefield").val('');
			$("#loginform #passwordfield").val('');
		});
	});
	
	$("#signup").off('click').click(function() {

		var email = $("#signupform #emailfield").val();
		var username = $("#signupform #usernamefield").val();
		var password = $("#signupform #passwordfield").val();
		var cpassword = $("#signupform #cpasswordfield").val();
		var topass = false;
		if(email==""&&username==""&&password==""&&cpassword=="") {}
		else if(email==""||username==""||password==""||cpassword=="") {
			showMessageDialog({
				title: "Error",
				content: "Please fill up all the fields.",
				callback: function(){
					showComponent("signupform");
					showComponent("backbutton");
				}
			});
		}
		else if(!validateEmail(email)) {
			showMessageDialog({
				title: "Error",
				content: "Please enter a valid email address.",
				callback: function(){
					showComponent("signupform");
					showComponent("backbutton");
				}
			});
		}
		else if(evaluatePassword(password)<3) {
			showMessageDialog({
				title: "Error",
				content: "Password is not strong enough.",
				callback: function(){
					showComponent("signupform");
					showComponent("backbutton");
				}
			});
		}
		else if(password!=cpassword) {
			showMessageDialog({
				title: "Error",
				content: "The passwords do not match.",
				callback: function(){
					showComponent("signupform");
					showComponent("backbutton");
				}
			});
		}
		else {
			topass = true;
		}
		if(topass) {
			showWaitDialog({content:"Registering new account . . . ."});
			
			var data = {
				'email': email,
				'username': username,
				'password': md5(password)
			}
			
			volatileCall('register','register_res',data,function(res) {
				if(res=='Registration is successful.') {
					showMessageDialog({
						title: "Registration",
						content: res,
						callback: function(){
							$("#loginform #usernamefield").val(username);
							$("#loginform #passwordfield").val(password);
							showComponent("loginform");
						}
					});
				}
				else {
					showMessageDialog({
						title: "Error",
						content: res,
						callback: function(){
							showComponent("signupform");
							showComponent("backbutton");
						}
					});
				}
			}, function() {
				showMessageDialog({
					title: "Error",
					content: "Failed to connect to server. Registration is unsuccessful.",
					callback: function(){
						showComponent("signupform");
						showComponent("backbutton");
					}
				});
			});
		}
	});
	$("#logoutbutton").off('click').click(function() {
		clearUserData(function() {
			$("#loginform #usernamefield").val('');
			$("#loginform #passwordfield").val('');
			$("#signupform #usernamefield").val('');
			$("#signupform #passwordfield").val('');
			$("#signupform #emailfield").val('');
			$("#signupform #cpasswordfield").val('');
			hideComponent("lobby");
			showComponent("loginform");
			environment.socket.emit('logout');
			
			environment.socket.removeAllListeners('challenge_accepted');
		});
	});
	$("#accountbutton").off('click').click(function() {
		showWaitDialog({content:"Retrieving account information . . . ."});
		volatileCall('retrieve','retrieve_res',environment.authData,function(res) {
			if(res!=null) {
				hideComponent("waitdialog");
				showComponent("accountform");
				showComponent("backbutton");
				$("#accountform #usernamefield").val(res.username);
				$("#accountform #emailfield").val(res.email);
				$("#accountform #npasswordfield").val('');
				$("#accountform #cpasswordfield").val('');
				$("#backbutton").off('click').click(function() {
					hideComponent("accountform");
					showComponent("lobby");
					hideComponent("backbutton");
				});
				$("#accountform #save").off('click').click(function() {
					var username = $("#accountform #usernamefield").val();
					var email = $("#accountform #emailfield").val();
					var npassword = $("#accountform #npasswordfield").val();
					var cpassword = $("#accountform #cpasswordfield").val();
					if(username=="") {
						$("#accountform #usernamefield").val(res.username);
					}
					if(email=="") {
						$("#accountform #emailfield").val(res.email);
					}
					if(username==res.username && email==res.email && npassword == ""){}
					else {
						var data = new Object();
						var topass = false;
						data.username = environment.authData.username;
						data.password = environment.authData.password;
						if(username!=res.username) {
							data.nusername = username;
							topass = true;
						}
						if(email!=res.email) {
							data.nemail = email;
							topass = true;
						}
						if(npassword != "") {
							if(evaluatePassword(npassword)<3) {
								showMessageDialog({
									title: "Error",
									content: "New Password is not strong enough.",
									callback: function(){
										showComponent("accountform");
										showComponent("backbutton");
									}
								});
							}
							else {
								if(npassword != cpassword) {
									showMessageDialog({
										title: "Error",
										content: "Passwords do not match.",
										callback: function(){
											showComponent("accountform");
											showComponent("backbutton");
										}
									});
								}
								else {
									data.npassword = md5(npassword);
									topass = true;
								}
							}
						}
						if(!topass) {
							return;
						}
						showWaitDialog({content:"Saving changes to account . . . ."});
						volatileCall('change','change_res',data,function(res) {
							if(res!=null) {
								console.log(res);
								if(res.response=="Success") {
									console.log('here');
									saveUserData(res.data.username,res.data.password,function() {
										environment.authData = res.data;
										showMessageDialog({
											title: "Account",
											content: 'Changes to account are saved successfully.',
											callback: function(){
												showComponent("lobby");
											}
										});
									});
								}
								else {
									showMessageDialog({
										title: "Error",
										content: res,
										callback: function(){
											showComponent("accountform");
											showComponent("backbutton");
										}
									});
								}
							}
							else {
								showMessageDialog({
									title: "Error",
									content: "An error has occured while trying to save changes.",
									callback: function(){
										showComponent("accountform");
										showComponent("backbutton");
									}
								});
							}
							
						}, function() {
							showMessageDialog({
								title: "Error",
								content: "Failed to connect to server. Changes to account are not saved successfully.",
								callback: function(){
									showComponent("accountform");
									showComponent("backbutton");
								}
							});
						});
					}
				});
			}
			else {
				showMessageDialog({
					title: "Error",
					content: "An error has occured while retrieving account information.",
					callback: function(){
						showComponent("lobby");
					}
				});
			}
		}, function() {
			showMessageDialog({
				title: "Error",
				content: "Failed to connect to server. Cannot retrieve account information.",
				callback: function(){
					showComponent("lobby");
				}
			});
		});
		
	});
	
	$("#gamebutton").off('click').click(function() {
		hideComponent("lobby");
		showComponent('gameroom');
		showComponent("backbutton");
		$("#battleinvitationslistview").html('');
		$("#challengerslistview").html('');

		$("#battleinvitations").off('click').click(function() {
			var height = $(window).height();
			$("#battleinvitationslistview").height(height-400);
			hideComponent("battlechallengersform");
			showComponent("battleinvitationsform");
		});
		$("#battlechallengers").off('click').click(function() {
			var height = $(window).height();
			$("#challengerslistview").height(height-325);
			hideComponent("battleinvitationsform");
			showComponent("battlechallengersform");
		});
		$("#battleinvitations").click();
		
		environment.socket.emit('getbattleinvitations');
		environment.socket.emit('getchallengers',environment.authData);
		environment.socket.emit('getchallengedata',environment.authData);
		
		var updater = setInterval(function() {
			environment.socket.emit('getbattleinvitations');
			environment.socket.emit('getchallengers',environment.authData);
			environment.socket.emit('getchallengedata',environment.authData);
		},20000);
		
		$("#backbutton").off('click').click(function() {
			hideComponent("gameroom");
			showComponent("lobby");
			hideComponent("backbutton");
			environment.socket.removeAllListeners('battleinvitations_update');
			environment.socket.removeAllListeners('challengers_update');
			environment.socket.removeAllListeners('opponents_update');
			clearInterval(updater);
		});
		
		var gbattleinvitations = new Array();
		var gchallengers = new Array();
		var gopponents = new Array();
		
		environment.socket.on('battleinvitations_update',function(battleinvitations) {
			environment.socket.emit('getchallengedata',environment.authData);
			gbattleinvitations = battleinvitations;
			var html = "";
			var inlist = false;
			for(var i=0;i<battleinvitations.length;i++) {
				var mine = battleinvitations[i].username == environment.authData.username;;
				inlist = inlist || mine;
				var theme = 'a';
				if(mine) {
					theme = 'c';
				}
				else {
					for(var j=0;j<gopponents.length;j++) {
						if(battleinvitations[i].username==gopponents[j].username) {
							theme = 'b';
						}
					}
				}
				html = html + "<li class='inv' data-theme="+theme+"><a data-role='button'><span class='usernameinfo'>"+battleinvitations[i].username+"</span><span class='ui-li-count'>"+paddy(Math.round(battleinvitations[i].score),6)+"</span></a></li>";
				inlist = inlist || battleinvitations[i].username == environment.authData.username;
			}
			$("body").off('click','.inv').on('click','.inv',function() {
				var type = $(this).attr('data-theme');
				var username = $(this).find(".usernameinfo").html();
				if(type=='a') {
					var htmlV = "<table>" +
					"<tr>" +
					"<td width=100><span class='fontclass5'>Challenger</span></td>" +
					"<td>"+environment.authData.username+"</td>" +
					"</tr>" +
					"<tr>" +
					"<td><span class='fontclass6'>Opponent</span></td>" +
					"<td>"+username+"</td>" +
					"</tr>" +
					"</table>";
					showConfirmDialog({
						title: "Challenge",
						content: htmlV,
						callback: function(){
							showWaitDialog({content:"Sending battle challenge . . . ."});
							var challengeData = {
									'username':environment.authData.username,
									'password':environment.authData.password,
									'opponent':username
							};
							volatileCall('challenge','challenge_res',challengeData,function(res) {
								if(res != 'Success') {
									showMessageDialog({
										title: "Error",
										content: "An error has occured while sending battle challenge.",
										callback: function(){
											showComponent("gameroom");
											$("#battleinvitations").click();
											showComponent("backbutton");
										}
									});
								}
								else {
									hideComponent("waitdialog");
									showComponent("gameroom");
									$("#battleinvitations").click();
									showComponent("backbutton");
									var opp = $(".inv").has(".usernameinfo:contentIs('"+challengeData.opponent+"')");
									opp.attr('data-theme','b');
									opp.find('a').mouseout();
								}
							},function(){
								showMessageDialog({
									title: "Error",
									content: "Failed to connect to server. Cannot send battle challenge.",
									callback: function(){
										showComponent("gameroom");
										$("#battleinvitations").click();
										showComponent("backbutton");
									}
								});
							});
						}
					});
				}
				if(type=='b') {
					var htmlV = "Cancel battle challenge.";
					showConfirmDialog({
						title: "Challenge",
						content: htmlV,
						callback: function(){
							showWaitDialog({content:"Cancelling battle challenge . . . ."});
							var challengeData = {
									'username':environment.authData.username,
									'password':environment.authData.password,
									'opponent':username
							};
							volatileCall('cancelchallenge','cancelchallenge_res',challengeData,function(res) {
								if(res != 'Success') {
									showMessageDialog({
										title: "Error",
										content: "An error has occured while cancelling battle challenge.",
										callback: function(){
											showComponent("gameroom");
											$("#battleinvitations").click();
											showComponent("backbutton");
										}
									});
								}
								else {
									hideComponent("waitdialog");
									showComponent("gameroom");
									$("#battleinvitations").click();
									showComponent("backbutton");
									environment.socket.emit('getbattleinvitations');
								}
							},function(){
								showMessageDialog({
									title: "Error",
									content: "Failed to connect to server. Cannot cancel battle challenge.",
									callback: function(){
										showComponent("gameroom");
										$("#battleinvitations").click();
										showComponent("backbutton");
									}
								});
							});
						}
					});
				}
			});
			$("#battleinvitationslistview").html(html);
			$("#battleinvitationslistview").listview('refresh');
			if(inlist) {
				$("#postbattleinvitation").html('Cancel Battle Invitation');
				$("#postbattleinvitation").button('refresh');
				$("#postbattleinvitation").removeClass('post');
				$("#postbattleinvitation").addClass('cancel');
			}
			else {
				$("#postbattleinvitation").html('Post Battle Invitation');
				$("#postbattleinvitation").button('refresh');
				$("#postbattleinvitation").addClass('post');
				$("#postbattleinvitation").removeClass('cancel');
			}
		});
		
		environment.socket.on('challengers_update',function(challengers) {
			gchallengers = challengers;
			if(challengers!='Failed') {
				var html = "";
				for(var i=0;i<challengers.length;i++) {
					var theme = 'a';
					html = html + "<li class='chal' data-theme="+theme+"><a data-role='button'><span class='usernameinfo'>"+challengers[i].username+"</span><span class='ui-li-count'>"+paddy(Math.round(challengers[i].score),6)+"</span></a></li>";
				}
				$("#challengerslistview").html(html);
				$("#challengerslistview").listview('refresh');
				$("body").off('click','.chal').on('click','.chal',function() {
					var username = $(this).find(".usernameinfo").html();
					var htmlV = "<div>Accept Challenge</div><table>" +
					"<tr>" +
					"<td width=100><span class='fontclass5'>Challenger</span></td>" +
					"<td>"+username+"</td>" +
					"</tr>" +
					"</table>";
					showConfirmDialog({
						title: "Challenge",
						content: htmlV,
						callback: function(){
							showWaitDialog({content:"Accepting battle challenge . . . ."});
							var challengeData = {
									'username':environment.authData.username,
									'password':environment.authData.password,
									'challenger':username
							};
							volatileCall('acceptchallenge','acceptchallenge_res',challengeData,function(res) {
								if(res != 'Success') {
									showMessageDialog({
										title: "Error",
										content: "An error has occured while accepting battle challenge.",
										callback: function(){
											showComponent("gameroom");
											$("#battleinvitations").click();
											showComponent("backbutton");
										}
									});
								}
								else {
									hideComponent("waitdialog");
									var time = 20;
									showMessageDialog({
										title: "Battle",
										content: "Waiting for <span class='fontclass5'>"+username+"</span><span id='waittimer' style='margin-left:40px'>"+time+"s</span>",
										nobutton: true
									});
									
									var timeH = setInterval(function() {
										time = time-1;
										$("#waittimer").html(""+time+"s");
										if(time <= 0) {
											clearInterval(timeH);
										}
									},1000);
								}
							},function(){
								showMessageDialog({
									title: "Error",
									content: "Failed to connect to server. Cannot accept battle challenge.",
									callback: function(){
										showComponent("gameroom");
										$("#battleinvitations").click();
										showComponent("backbutton");
									}
								});
							});
						}
					});
				});
			}
		});
		environment.socket.on('opponents_update',function(opponents) {
			gopponents = opponents;
			var el = $(".inv[data-theme='b']").attr('data-theme','a');
			$(".inv").find('a').mouseout();
			if(opponents!='Failed') {
				for(var i=0;i<opponents.length;i++) {
					var opp = $(".inv").has(".usernameinfo:contentIs('"+opponents[i].username+"')");
					opp.attr('data-theme','b');
					opp.find('a').mouseout();
				}
			}
		});
	});
	$("#postbattleinvitation").off('click').click(function() {
		if($(this).hasClass('post')) {
			showWaitDialog({content:"Posting battle invitation . . . ."});
			volatileCall('postbattleinvitation','postbattleinvitation_res',environment.authData,function(res) {
				if(res != 'Success') {
					showMessageDialog({
						title: "Error",
						content: "An error has occured while posting battle invitation.",
						callback: function(){
							showComponent("gameroom");
							$("#battleinvitations").click();
							showComponent("backbutton");
						}
					});
				}
				else {
					hideComponent("waitdialog");
					showComponent("gameroom");
					$("#battleinvitations").click();
					showComponent("backbutton");
				}
			},function(){
				showMessageDialog({
					title: "Error",
					content: "Failed to connect to server. Cannot post battle invitation.",
					callback: function(){
						showComponent("gameroom");
						$("#battleinvitations").click();
						showComponent("backbutton");
					}
				});
			});
		}
		else {
			showWaitDialog({content:"Cancelling battle invitation . . . ."});
			volatileCall('cancelbattleinvitation','cancelbattleinvitation_res',environment.authData,function(res) {
				if(res != 'Success') {
					showMessageDialog({
						title: "Error",
						content: "An error has occured while cancelling battle invitation.",
						callback: function(){
							showComponent("gameroom");
							$("#battleinvitations").click();
							showComponent("backbutton");
						}
					});
				}
				else {
					hideComponent("waitdialog");
					showComponent("gameroom");
					$("#battleinvitations").click();
					showComponent("backbutton");
				}
			},function(){
				showMessageDialog({
					title: "Error",
					content: "Failed to connect to server. Cannot cancel battle invitation.",
					callback: function(){
						showComponent("gameroom");
						$("#battleinvitations").click();
						showComponent("backbutton");
					}
				});
			});
		}
	});
	
	showWaitDialog({content:"Connecting to server . . . ."});
	setTimeout(initConnection,200);
}

function initConnection() {
	var expired = false;
	var timeoutId = window.setTimeout(function() {
		console.log('error');
		showMessageDialog({
			title: "Error",
			content: "Cannot establish a connection to the server.",
			callback: function(){
				showWaitDialog({content:"Connecting to server . . . ."});
				initConnection();
			}
		});
		expired = true;
	}, environment.timeout);
	$.getScript(environment.server_url+"/socket.io/socket.io.js",function(res,status){
		if(!expired){
			environment.socket = io.connect(environment.server_url);
			window.clearTimeout(timeoutId);
			console.log(status);
			hideComponent("waitdialog");
			getUserData(function(data) {
				if(data.username==null) {
					showComponent("loginform");
				}
				else {
					login(data);
				}
			});
		}
	});
}
