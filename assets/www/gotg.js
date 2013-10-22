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
		var email = $("#email").val();
		var username = $("#username").val();
		var password = $("#password").val();
		var cpassword = $("#cpassword").val();
		
		var topass = false;
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


