function showWaitDialog(params) {
	$(".shown").removeClass("shown").addClass("hidden");
	$("#waitdialog #content").html(params.content);
	showComponent("waitdialog");
}

function showMessageDialog(params) {
	var shown = $(".shown");
	shown.removeClass("shown").addClass("hidden");
	$("#messagedialog #title").html(params.title);
	$("#messagedialog #content").html(params.content);
	showComponent("messagedialog");
	$("#messagedialog #button").off('click').click(function() {
		$("#messagedialog").addClass("hidden");
		$("#messagedialog").removeClass("shown");
		if(params.callback != null){
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