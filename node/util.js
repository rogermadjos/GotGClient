exports.checkAuth = function(connection,username,password,callback) {
	var query = "select state from users where username='"+username+"' and password='"+password+"'";
	connection.query(query,function(err,results) {
		if(results.length <= 0) {
			callback(-1);
		}
		else {
			callback(results[0].state);
		}
	});
}

exports.assignLoginID = function(connection,username,callback) {
	var charbase = 'ABCDEF0123456789';
	var id = '';
	for(var i=0;i<32;i++) {
		var rand = Math.floor(Math.random()*charbase.length);
		id = id + charbase.charAt(rand);
	}
	var query = "update users set loginid='"+id+"',timeactive=CURRENT_TIMESTAMP,state=1 where username='"+username+"'";
	console.log(query);
	connection.query(query,function() {
		callback(id);
	});
}

exports.getUsername = function(connection,loginid) {
	
}

exports.postPublicInvitation = function(connection,username,password) {
	
}