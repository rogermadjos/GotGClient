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

 
var server_url = "http://192.168.1.6:8050";
var socket;
var timeout = 30000;

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
	
	setTimeout(initConnection,1000);
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
	var wait_res = true;
	socket.emit('login', data);
	var handler = function(data) {
		wait_res = false;
		$("#wait").removeClass("fadein");
		$("#wait").css("display","none");
		if(data.response=="Valid") {
			saveUserData(username,password,function() {
				$("#lobby").css("display","block");
				$("#lobby").addClass("fadein");
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
	setTimeout(function() {
		if(wait_res) {
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
	},timeout);
	socket.on('login_res', handler);
}

function prepare() {
	
	$("#logoutbutton").off('click').click(function() {
		clearUserData(function() {
			$("#usernamefield").val("");
			$("#passwordfield").val("");
			$("#lobby").css("display","none");
			$("#lobby").removeClass("fadein");
			$("#loginform").css("display","block");
			$("#loginform").addClass("fadein");
		});
	});
	
	$("#signupbutton").off('click').click(function() {
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
		
		$('#email').pressEnter(function(){
			$("#signup").click();
		});
		$('#email').restrict([' ']);
		$('#username').pressEnter(function(){
			$("#signup").click();
		});
		$('#username').restrict([' ']);
		$('#password').pressEnter(function(){
			$("#signup").click();
		});
		$('#password').restrict([' ']);
		$('#cpassword').pressEnter(function(){
			$("#signup").click();
		});
		$('#cpassword').restrict([' ']);
	});
	
	$('#usernamefield').pressEnter(function(){
		$("#loginbutton").click();
	});
	$('#usernamefield').restrict([' ']);
	$('#passwordfield').pressEnter(function(){
		$("#loginbutton").click();
	});
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
	
	$("#signup").off('click').click(function() {
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
			
			var wait_res = true;
			socket.emit('register', data);
			var handler = function(data) {
				wait_res = false;
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
			setTimeout(function() {
				if(wait_res) {
					socket.removeListener('register_res', handler);
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
			},timeout);
			
			socket.on('register_res', handler);
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


