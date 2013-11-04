
var environment = new Object();
environment.server_url = "http://192.168.1.3:8050";
environment.socket = null;
environment.timeout = 2000;
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
	$("#usernamefield").restrict(' ');
	$("#passwordfield").restrict(' ');
	$("#emailfield").restrict(' ');
	$("#cpasswordfield").restrict(' ');
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
		$("#backbutton").off('click').click(function() {
			hideComponent("signupform");
			showComponent("loginform");
			hideComponent("backbutton");
		});
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
					
				}
			});
		}
	});
}
