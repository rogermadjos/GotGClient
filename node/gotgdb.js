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

exports.saveSocket = function(data,connection,callback) {
	var sql = "delete from sockets where userid=(select userid from users where username=?)";
	var params = [data.username];
	connection.query(sql,params,function(err,results) {
		sql = "insert into sockets values ((select userid from users where username=?),?)";
		params = [data.username,data.socketid];
		connection.query(sql,params,function(err,results) {
			callback();
		});
	});
};

exports.getSocket = function(user,connection,callback) {
	var sql = "select * from sockets where userid=(select userid from users where username=?)";
	var params = [user];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback(results[0].socketid);
		}
		else {
			callback(null);
		}
	});
}

exports.deleteSocket = function(socketid,connection) {
	var sql = "delete from sockets where socketid=?";
	var params = [socketid];
	connection.query(sql,params,function(err,results) {
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
						'username':data.username,
						'password':data.password,
						'email':email
				};
				callback(res);
			});
		}
		else {
			callback(null);
		}
	});
}

exports.changeAccountInfo = function(data,connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			exports.getUserId(data.username,connection,function(userid) {
				if(data.nusername!=null) {
					isUsernameAvailable(data.username,data.nusername,connection,function(res) {
						if(!res) {
							callback("New username is not available.");
						}
						else {
							if(data.nemail!=null) {
								isEmailAvailable(data.username,data.nemail,connection,function(res) {
									if(!res) {
										callback("New email address is not available.");
									}
									else {
										if(data.npassword!=null) {
											var sql = "update users set username=?, email=?, password=? where userid=?";
											var params = [data.nusername,data.nemail,data.npassword,userid];
											connection.query(sql,params,function(err) {
												if(err==null) {
													getUsernamePassword(userid,connection,function(values) {
														callback({'response':'Success','data':values});
													});
												}
												else {
													callback(null);
												}
											});
										}
										else {
											var sql = "update users set username=?, email=? where userid=?";
											var params = [data.nusername,data.nemail,userid];
											connection.query(sql,params,function(err) {
												if(err==null) {
													getUsernamePassword(userid,connection,function(values) {
														callback({'response':'Success','data':values});
													});
												}
												else {
													callback(null);
												}
											});
										}
									}
								});
							}
							else {
								if(data.npassword!=null) {
									var sql = "update users set username=?, password=? where userid=?";
									var params = [data.nusername,data.npassword,userid];
									connection.query(sql,params,function(err) {
										if(err==null) {
											getUsernamePassword(userid,connection,function(values) {
												callback({'response':'Success','data':values});
											});
										}
										else {
											callback(null);
										}
									});
								}
								else {
									var sql = "update users set username=? where userid=?";
									var params = [data.nusername,userid];
									connection.query(sql,params,function(err) {
										if(err==null) {
											getUsernamePassword(userid,connection,function(values) {
												callback({'response':'Success','data':values});
											});
										}
										else {
											callback(null);
										}
									});
								}
							}
						}
					});
				}
				else {
					if(data.nemail!=null) {
						isEmailAvailable(data.username,data.nemail,connection,function(res) {
							if(!res) {
								callback("New email address is not available.");
							}
							else {
								if(data.npassword!=null) {
									var sql = "update users set email=?, password=? where userid=?";
									var params = [data.nemail,data.npassword,userid];
									connection.query(sql,params,function(err) {
										if(err==null) {
											getUsernamePassword(userid,connection,function(values) {
												callback({'response':'Success','data':values});
											});
										}
										else {
											callback(null);
										}
									});
								}
								else {
									var sql = "update users set email=? where userid=?";
									var params = [data.nemail,userid];
									connection.query(sql,params,function(err) {
										if(err==null) {
											getUsernamePassword(userid,connection,function(values) {
												callback({'response':'Success','data':values});
											});
										}
										else {
											callback(null);
										}
									});
								}
							}
						});
					}
					else {
						if(data.npassword!=null) {
							var sql = "update users set password=? where userid=?";
							var params = [data.npassword,userid];
							connection.query(sql,params,function(err) {
								if(err==null) {
									getUsernamePassword(userid,connection,function(values) {
										callback({'response':'Success','data':values});
									});
								}
								else {
									callback(null);
								}
							});
						}
					}
				}
			});

		}
		else {
			callback(null);
		}
	});
}

exports.getChallengers = function(opponent,connection,callback) {
	var sql = "select users.username,scores.score " +
			"from users inner join (select challengeruserid from challengers where opponentuserid=" +
			"(select userid from users where username=?)) as challengers on users.userid=" +
			"challengers.challengeruserid join scores on scores.userid=challengers.challengeruserid";
	var params = [opponent];
	connection.query(sql,params,function(err,results) {
		if(err!=null) {
			var response = 'Failed';
			callback(response);
		}
		else {
			var response = results;
			callback(response);
		}
	});
}

exports.checkBattleValid = function(data,connection,callback) {
	var sql = "select * from challengers where opponentuserid=" +
			"(select userid from users where username=?) and challengeruserid=" +
			"(select userid from users where username=?)";
	var params = [data.username,data.challenger];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback(true);
		}
		else {
			callback(false);
		}
	});
}

exports.getChallengeData = function(challenger,connection,callback) {
	var sql = "select users.username " +
		"from users inner join (select opponentuserid from challengers where challengeruserid=" +
		"(select userid from users where username=?)) as opponents on users.userid=" +
		"opponents.opponentuserid";
	var params = [challenger];
	connection.query(sql,params,function(err,results) {
		if(err!=null) {
			var response = 'Failed';
			callback(response);
		}
		else {
			var response = results;
			callback(response);
		}
	});
}

exports.updateBattleInvitations = function(connection,callback) {
	var sql = "delete from battleinvitations where TIMESTAMPDIFF(HOUR,posttime,now()) >= 2";
	connection.query(sql,function(err,res) {
		if(callback!=null) {
			callback(res.affectedRows > 0);
		}
	});
}

exports.updateBattleChallenges = function(connection,callback) {
	var sql = "delete from challengers where TIMESTAMPDIFF(MINUTE,posttime,now()) >= 30";
	connection.query(sql,function(err,res) {
		if(callback!=null) {
			callback(res.affectedRows > 0);
		}
	});
}

exports.postBattleInvitation = function(data, connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			var sql = 'insert into battleinvitations select userid,now() from users where username=?';
			var params = [data.username];
			connection.query(sql,params,function(err,results) {
				var response = 'Success';
				if(err != null) {
					response = 'Failed';
				}
				callback(response);
			});
		}
		else {
			var response = 'Failed';
			callback(response);
		}
	});
}

exports.cancelBattleInvitation = function(data, connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			var sql = 'delete from battleinvitations where battleinvitations.userid = any(select users.userid from users where users.username = ?)';
			var params = [data.username];
			connection.query(sql,params,function(err,results) {
				var response = 'Success';
				callback(response);
				console.log(err);
			});
		}
		else {
			var response = 'Failed';
			callback(response);
		}
	});
}

exports.cancelChallenge = function(data, connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			var sql = 'delete from challengers where opponentuserid = (select users.userid from users where users.username = ?) and challengeruserid = (select users.userid from users where users.username = ?)';
			var params = [data.opponent,data.username];
			connection.query(sql,params,function(err,results) {
				var response = 'Success';
				callback(response);
			});
		}
		else {
			var response = 'Failed';
			callback(response);
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

exports.challengeBattle = function(data,connection,callback) {
	auth(data,connection,function(res) {
		if(res) {
			var sql = "SELECT * FROM gotgdb.challengers where opponentuserid = " +
					"(select userid from users where username=?) and challengeruserid = " +
					"(select userid from users where username=?)";
			var params = [data.opponent,data.username];
			connection.query(sql,params,function(err,results) {
				if(err!=null) {
					callback('Failed');
				}
				else {
					if (results.length > 0) {
						callback('Failed');
					}
					else {
						var sql = "insert into challengers values(" +
								"(select users.userid from users where users.username=?)," +
								"(select users.userid from users where users.username=?)" +
								",now())";
						var params = [data.opponent,data.username];
						connection.query(sql,params,function(err,results) {
							if(err!=null) {
								callback('Failed');
							}
							else {
								callback('Success');
							}
						});
					}
				}
			});

		}
		else {
			callback('Failed');
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

function getUsernamePassword(userid,connection,callback) {
	var sql = "select username,password from users where userid=?";
	var params = [userid];
	connection.query(sql,params,function(err,results) {
		var data = {
			'username':results[0].username,
			'password':results[0].password
		}
		callback(data);
	});
}

function isUsernameAvailable(username,nusername,connection,callback) {
	var sql = "select userid from users where username!=? and username=?";
	var params = [username,nusername];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback(false);
		}
		else {
			callback(true);
		}
	});
}

function isEmailAvailable(username,nemail,connection,callback) {
	var sql = "select userid from users where email not in(select email from users where username=?) and email=?";
	var params = [username,nemail];
	connection.query(sql,params,function(err,results) {
		if(results.length > 0) {
			callback(false);
		}
		else {
			callback(true);
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