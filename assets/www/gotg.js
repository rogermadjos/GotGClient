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
 
var server_url = "http://192.168.1.6:8050";
var socket;
var timeout = 5000;

$(document).ready(function() {
    window.isphone = false;
    if(document.URL.indexOf("http://") === -1 
        && document.URL.indexOf("https://") === -1) {
        window.isphone = true;
    }

    if(window.isphone) {
        document.addEventListener("deviceready", init(), false);
    }
    else {
        init();
    }
});
 
function init() {
	setTimeout(initConnection,1000);
}

function initConnection() {
	var loaded = false;
	setTimeout(function() {
		if(!loaded) {
			$("#wait").removeClass("fadein");
			$("#wait").css("display","none");
			$("#errorcontent").html("Cannot connect to server.");
			$("#errorconnect").css("display","block");
			$("#errorconnect").addClass("fadein");
			$("#retry").click(function() {
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
		$("#wait").removeClass("fadein");
		$("#wait").css("display","none");
		$("#loginform").css("display","block");
		$("#loginform").addClass("fadein");
		prepare();
	});
}

function prepare() {
	$("#signupbutton").click(function() {
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
		})
		$('#username').pressEnter(function(){
			$("#signup").click();
		})
		$('#password').pressEnter(function(){
			$("#signup").click();
		})
		$('#cpassword').pressEnter(function(){
			$("#signup").click();
		})
	});
	
	$("#loginbutton").click(function() {
		var username = $("#usernamefield").val();
		var password = $("#passwordfield").val();
		password = md5(password);
//		$("#loginform").removeClass("fadein");
//		$("#loginform").css("display","none");
//		$("#lobby").css("display","block");
//		$("#lobby").addClass("fadein");
	});
	
	$("#backbutton").click(function() {
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
	
	$("#signup").click(function() {
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
			$("#ok").click(function() {
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
			
			console.log(data);
			var wait_res = true;
			socket.emit('register', data);
			setTimeout(function() {
				if(wait_res) {
					socket.removeListener('register_res', handler);
					$("#wait").removeClass("fadein");
					$("#wait").css("display","none");
					$("#errorcontent").html("Cannot connect to server.");
					$("#errorconnect").css("display","block");
					$("#errorconnect").addClass("fadein");
					$("#retry").click(function() {
						$("#errorconnect").removeClass("fadein");
						$("#errorconnect").css("display","none");
						$("#signupform").css("display","block");
						$("#signupform").addClass("fadein");
					});
				}
			},timeout);
			var handler = function(data) {
				wait_res = false;
				$("#wait").removeClass("fadein");
				$("#wait").css("display","none");
				$("#dialogtitle").html("Sign Up");
				$("#dialogcontent").html(data.response);
				$("#dialog").css("display","block");
				$("#dialog").addClass("fadein");
				if(data.response=="Registration is successful.") {
					$("#ok").click(function() {
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
					$("#ok").click(function() {
						$("#dialog").removeClass("fadein");
						$("#dialog").css("display","none");
						$("#signupform").css("display","block");
						$("#signupform").addClass("fadein");
					});
				}
			};
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


