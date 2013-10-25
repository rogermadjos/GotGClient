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

exports.getBattleInvitations = function(connection,callback) {
	var sql = "select username,posttime,score from users "+
		"inner join battleinvitations on "+
		"battleinvitations.userid=users.userid "+
		"inner join scores on "+
		"battleinvitations.userid=scores.userid order by posttime"
	;
	connection.query(sql,function(err,results) {
		if(callback!=null) {
			callback(results);
		}
	});
}

exports.updateBattleInvitations = function(connection,callback) {
	var sql = "delete from battleinvitations where (now()-posttime) >= 3600";
	connection.query(sql,function() {
		if(callback!=null) {
			callback();
		}
	});
}

exports.getChecksum = function(tablename, connection,callback) {
	var sql = "checksum table "+tablename;
	connection.query(sql,function(err,res) {
		if(callback!=null) {
			callback(res[0].Checksum);
		}
	});
}

exports.postBattleInvitation = function(data, connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			var sql = 'insert into battleinvitations select userid,now() from users where username=?';
			var params = [data.username];
			connection.query(sql,params,function(err,results) {
				var response = {
						'response': 'Success'
				};
				if(err != null) {
					response.response = 'Failed';
				}
				callback(response);
			});
		}
		else {
			var response = {
					'response': 'Failed'
			};
			callback(response);
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