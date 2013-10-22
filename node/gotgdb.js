exports.register = function(data,connection,callback) {
	var sql = "select * from users where email=?";
	var params = [data.email];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback("E-mail address already exists.");
		}
		else {
			sql = "select * from users where username=?";
			params = [data.username];
			connection.query(sql,params,function(err,results) {
				if(results.length > 0) {
					callback("Username already exists.");
				}
				else {
					var crypto = require('crypto');
					var key = 'GOTG_623672211';
					sql = "insert into tempusers values (?,?,?,now(),?)";
					var hash = crypto.createHash('md5').update(data.email+data.username+key).digest("hex");
					params = [data.email,data.username,data.password,hash];
					connection.query(sql,params,function() {
						var email   = require("./node_modules/emailjs/email");
						var server  = email.server.connect({
						   user:    "roger.madjos", 
						   password:"ken_0121", 
						   host:    "smtp.gmail.com", 
						   ssl:     true
						});
						var message = "Welcome to Game of the Generals";
						server.send({
						   text:    message, 
						   from:    "roger.madjos@gmail.com", 
						   to:      "roger.madjos@gmail.com",
						   subject: "testing emailjs"
						}, function(err, message) {
							console.log(err || message);
						});
						callback("validation");
					});
				}
			});
		}
	});

};