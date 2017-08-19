// using mongodb as our database
const mongoose = require('mongoose');
const rs = require('randomstring');
const config = require('./config');

class DB {
	constructor(){
		// db options (using user to add security)
		this.options = {
			db: {native_parser: true},
			server: {poolSize: 5},
			user: config.db.user,
			password: config.db.password
		}
		// connect to database
		mongoose.connect('mongodb://'+ config.db.user + ':' + config.db.password+ '@localhost:27017/'+ config.db.dbname);
		this.DB = mongoose.connection;
		// schema
		this.userSchema = mongoose.Schema({
			username: String,
			password: String,
			usertype: String,
			email: String,
			beaconID: String,
			location: String,
			tmp: String
		});
		this.adfSchema = mongoose.Schema({
			beaconID: String,
			location: String,
			path: String
		});
		// define schema model
		this.user_m = mongoose.model('user_m',this.userSchema);
		this.adf_m = mongoose.model('adf_m',this.adfSchema);
	}
	// user-defined function
	user_register(name,pass,email,callback){
		var user_model = this.user_m;
		this.user_m.findOne({username: name},'username password email',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found => this account legal, create one
					let newUser = new user_model({username: name,password: pass,email: email,usertype: 'user',beaconID: null,location: null,tmp: null});
					newUser.save(function(s_err,newUser){
						if(s_err){
							callback(1,"internal error");
						}
						else{
							callback(0,"success");
						}
					});
				}
				else{
					// already existed => illegal
					callback(1,"duplicated");
				}
			}
		});
	}

	user_login(name,pass,callback){
		this.user_m.findOne({username: name, password: pass},'username password email',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found 
					callback(1,"login failed");
				}
				else{
					callback(0,"success");
				}
			}
		});
	}

	user_fetch(username,callback){
		this.user_m.findOne({username: name},'username password email',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found 
					callback(1,"wrong account");
				}
				else{
					// found this user, and then return instance
					callback(0,match);
				}
			}
		});
	}

	user_gettmpcode(name,callback){
		// generate the verify code and append to target user 
		this.user_m.findOne({username: name},'username password email tmp',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found 
					callback(1,"wrong account");
				}
				else{
					// found this user, and then generate random code
					var code = rs.generate({
						length: 12,
						charset: 'alphabetic'
					});
					match.tmp = code;
					match.save(function(err,update){
						if(err)
							callback(1,"internal error");
						else
							callback(0,{
								email: update.email,
								code: code
							});
					});
				}
			}
		});
	}

	user_verify(name,code,callback){
		this.user_m.findOne({username: name, tmp: code},'password email',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found 
					callback(1,"wrong code");
				}
				else{
					// match, then give it
					callback(0,{
						email: match.email,
						password: match.password
					});
				}
			}
		})
	}

	user_checkmail(email,callback){
		this.user_m.findOne({email: email},'username',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found 
					callback(0,"not found");
				}
				else{
					// existed
					callback(0,"existed");
				}
			}
		});
	}

	set_adf(id,path,loc,callback){
		var adf_model = this.adf_m;
		this.adf_m.findOne({beaconID: id},'location path',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// initial one for it
					let newAdf = new adf_model({beaconID: id,location: loc,path: path});
					newAdf.save(function(s_err,newAdf){
						if(s_err){
							callback(1,"internal error")
						}
						else{
							callback(0,"success");
						}
					});
				}
				else{
					// find! and then update!
					match.path = path;
					match.location = loc;
					match.save(function(s_err,match){
						if(s_err){
							callback(1,"internal error")
						}
						else{
							callback(0,"success");
						}
					});
				}
			}
		});
	}
	get_adf(id,callback){
		this.adf_m.findOne({beaconID: id},'location path',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found 
					callback(1,"external error");
				}
				else{
					// return result
					callback(0,match);
				}
			}
		});
	}
}

module.exports = {
	DB: new DB()
}