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