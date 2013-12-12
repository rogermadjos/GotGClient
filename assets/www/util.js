function showWaitDialog(params) {
	$(".shown").removeClass("shown").addClass("hidden");
	$("#waitdialog #content").html(params.content);
	showComponent("waitdialog");
}

function paddy(n, p, c) {
    var pad_char = typeof c !== 'undefined' ? c : '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

function showMessageDialog(params) {
	var shown = $(".shown");
	shown.removeClass("shown").addClass("hidden");
	$("#messagedialog #title").html(params.title);
	$("#messagedialog #content").html(params.content);
	if(params.nobutton) {
		$("#messagedialog #button").css('display','none');
	}
	else {
		$("#messagedialog #button").css('display','block');
	}
	showComponent("messagedialog");
	$("#messagedialog #button").off('click').click(function() {
		$("#messagedialog").addClass("hidden");
		$("#messagedialog").removeClass("shown");
		if(params.callback != null){
			params.callback();
		}
	});
}

function showConfirmDialog(params) {
	var shown = $(".shown");
	shown.removeClass("shown").addClass("hidden");
	$("#confirmdialog #title").html(params.title);
	$("#confirmdialog #content").html(params.content);
	showComponent("confirmdialog");
	$("#confirmdialog #buttontwo").off('click').click(function() {
		$("#confirmdialog").addClass("hidden");
		$("#confirmdialog").removeClass("shown");
		shown.addClass("fadein");
		shown.addClass("shown");
		shown.removeClass("hidden");
		if(params.cancelcallback!=null) {
			params.cancelcallback();
		}
	});
	$("#confirmdialog #buttonone").off('click').click(function() {
		if(params.callback!=null) {
			params.callback();
		}
	});
}

function showComponent(component){
	$("#"+component).addClass("fadein");
	$("#"+component).addClass("shown");
	$("#"+component).removeClass("hidden");
}

function hideComponent(component){
	$("#"+component).removeClass("fadein");
	$("#"+component).removeClass("shown");
	$("#"+component).addClass("hidden");
}

function volatileCall(call,response,data,handler,timeouthandler) {
	var tevent = setTimeout(function() {
		environment.socket.removeAllListeners (response);
		timeouthandler();
	},environment.timeout);
	var func = function(data) {
		clearTimeout(tevent);
		handler(data);
	}
	environment.socket.emit(call,data);
	environment.socket.once(response,func);
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

function login(data) {
	showWaitDialog({
		'content':'Logging in . . . .'
	});
	volatileCall('login','login_res',data,function(res) {
		if(res=='Valid') {
			saveUserData(data.username,data.password,function() {
				hideComponent('waitdialog');
				environment.authData = data;
				showComponent('lobby');
				
				environment.socket.on('challenge_accepted',function(opponent) {
					var time = 20;
					var htmlV = "Challenge is accepted by "+opponent+".<span id='waittimerb' style='margin-left:40px'>"+time+"s</span>";
					var shown = $(".shown");
					var timeH = setInterval(function() {
						time = time-1;
						$("#waittimerb").html(""+time+"s");
						if(time <= 0) {
							clearInterval(timeH);
							$("#confirmdialog").addClass("hidden");
							$("#confirmdialog").removeClass("shown");
							shown.addClass("fadein");
							shown.addClass("shown");
							shown.removeClass("hidden");
						}
					},1000);
					var data = {
						'username':environment.authData.username,
						'password':environment.authData.password,
						'opponent':opponent
					}
					showConfirmDialog({
						title: "Battle",
						content: htmlV,
						callback: function() {
							showWaitDialog({content:"Preparing battle requirements . . . ."});
							environment.socket.emit('engage',data);
							clearInterval(timeH);
						},
						cancelcallback: function() {
							environment.socket.emit('denybattle',data);
							clearInterval(timeH);
						}
					});
					
				});
			});
		}
		else {
			showMessageDialog({
				title: "Error",
				content: "Invalid username or password.",
				callback: function(){
					showComponent("loginform");
				}
			});
		}
	}, function() {
		showMessageDialog({
			title: "Error",
			content: "Failed to connect to server. Log in is unsuccessful.",
			callback: function(){
				showComponent("loginform");
			}
		});
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