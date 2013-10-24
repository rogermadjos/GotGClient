exports.register = function(data,connection,callback) {
	var sql = "select * from users where email=?";
	var params = [data.email];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback("E-mail address is already taken.");
		}
		else {
			sql = "select * from users where username=?";
			params = [data.username];
			connection.query(sql,params,function(err,results) {
				if(results.length > 0) {
					callback("Username is already taken.");
				}
				else {
					sql = "insert into users values (?,?,?,now())";
					params = [data.email,data.username,data.password];
					connection.query(sql,params,function() {
						callback("Registration is successful.");
					});
				}
			});
		}
	});
};

exports.login = function(data,connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			callback("Valid");
		}
		else {
			callback("Invalid");
		}
	})
};

function auth(data,connection,callback) {
	var sql = "select * from users where username=? and password=?";
	var params = [data.username,data.password];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback(true);
		}
		else {
			callback(false);
		}
	});
}