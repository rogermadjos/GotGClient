

$(function() {
    $('div[data-role="dialog"]').live('pagebeforeshow', function(e, ui) {
    ui.prevPage.addClass("ui-dialog-background ");
    });

    $('div[data-role="dialog"]').live('pagehide', function(e, ui) {
    $(".ui-dialog-background ").removeClass("ui-dialog-background ");
    });
});

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
}


