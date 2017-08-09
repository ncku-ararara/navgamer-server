// using mongodb as our database
const mongoose = require('mongoose');
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
			location: String
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