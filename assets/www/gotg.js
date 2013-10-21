

function init() {
	
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
	});
	
	$("#loginbutton").click(function() {
		$("#loginform").removeClass("fadein");
		$("#loginform").css("display","none");
		$("#lobby").css("display","block");
		$("#lobby").addClass("fadein");
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
		$("#signupform").removeClass("fadein");
		$("#backbutton").removeClass("fadein");
		$("#signupform").css("display","none");
		$("#signupform").css("opacity","0");
		$("#backbutton").css("visibility","hidden");
		$("#backbutton").css("opacity","0");
		$("#dialog").css("display","block");
		$("#dialog").addClass("fadein");
	});
}


