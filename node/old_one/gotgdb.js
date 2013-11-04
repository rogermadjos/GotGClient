exports.register = function(data,connection,callback) {
	var sql = "select userid from users where email=?";
	var params = [data.email];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback("E-mail address is already taken.");
		}
		else {
			sql = "select userid from users where username=?";
			params = [data.username];
			connection.query(sql,params,function(err,results) {
				if(results.length > 0) {
					callback("Username is already taken.");
				}
				else {
					sql = "insert into users (email,username,password,dateres) values (?,?,?,now())";
					params = [data.email,data.username,data.password];
					connection.query(sql,params,function() {
						sql = "insert into scores select userid,0 from users where username=?";
						params = [data.username];
						connection.query(sql,params,function() {
							callback("Registration is successful.");
							console.log(data.username+" is registered");
						});
					});
				}
			});
		}
	});
};

exports.getUserId = function(username,connection,callback) {
	var sql = "select userid from users where username=?";
	var params = [username];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback(results[0].userid);
		}
		else {
			callback(null);
		}
	});
}

exports.login = function(data,connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			callback("Valid");
		}
		else {
			callback("Invalid");
		}
	});
};

exports.retrieveInfo = function(data,connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			getEmail(data.username,connection,function(email) {
				var res = {
						'response': 'Valid',
						'username':data.username,
						'password':data.password,
						'email':email
				};
				callback(res);
			});
		}
		else {
			var res = {
					'response': 'Invalid'
			};
			callback(res);
		}
	});
}


function getEmail(username,connection,callback) {
	var sql = "select email from users where username=?";
	var params = [username];
	connection.query(sql,params,function(err,results) {
			callback(results[0].email);
	});
}

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