// using mongodb as our database
const mongoose = require('mongoose');
const rs = require('randomstring');
const config = require('./config');
const moment = require('moment');

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
		// user
		this.userSchema = mongoose.Schema({
			username: String,
			password: String,
			email: String,
			tmp: String,

			current_charID: String,
			value_strength: Number,
			value_intelligence: Number,
			value_like: Number,
			value_money: Number,
			value_playTime_hr: Number,
			value_level: Number,
			props_quant: [{
				id: Number,
				quant: Number
			}],
			furni_quant: [{
				id: Number,
				quant: Number
			}],
			fav_shopID:[{shopID: String}],
			event_coll:[{id: Number, num: Number}],
			achievement_coll:[{id: Number, level: Number}],
			chara_startTime: String,
			chara_coll: [{
				id: Number,
				name: String,
				value_strength: Number,
				value_intelligence: Number,
				value_like: Number,
				ending: Number,
				startTime: String,
				endTime: String
			}],
			gameMode: Boolean,
			gameObj: Boolean,
			infoObj: Boolean,
			decoration: [{
				id: Number,
				pos: { x: Number, y: Number, z: Number },
				index: Number
			}]
		});
		// shop keeper info
		this.shopKeeperSchema = mongoose.Schema({
			shopID: String,
			email: String,
			password: String,
			shopName: String,
			phone: String,
			updateTime: String,
			problemReport: [{ who: String, date: String, content: String }],
			shop_category_1: Number,
			shop_category_2: Number,
			shop_principal: String,
			shop_principal_gender: Number,
			shop_principal_phone: String,
			shop_principal_email: String,
			tmp: String
		});
		// shop info
		this.shopInfoSchema = mongoose.Schema({
			shopID: String,
			shopName: String,
			shopAddress: String,
			openTime: [{
				open: Boolean,
				timePeriod: [{
					begin_hr: String,
					begin_min: String,
					end_hr: String,
					end_min: String
				}]
			}],
			infoList: [{
				title: String,
				content: String
			}]
		}); 
		// user comment
		this.commentSchema = mongoose.Schema({
			userID: String,
			shopID: String,
			text_content: String,
			picture: { data: Buffer, contentType: String },
			time: String,
			score: Number
		});
		// adf usage
		this.adfSchema = mongoose.Schema({
			beaconID: String,
			location: String,
			path: String
		});
		// define schema model
		this.user_m = mongoose.model('user_m',this.userSchema);
		this.owner_m = mongoose.model('owner_m',this.shopKeeperSchema);
		this.shop_m = mongoose.model('shop_m',this.shopInfoSchema);
		this.comm_m = mongoose.model('comm_m',this.commentSchema);
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
					let newUser = new user_model({username: name,password: pass,email: email,tmp: null,
							value_strength: 0, value_intelligence: 0, value_like: 0, value_money: 0,
							value_playTime_hr: 0, value_level: 0,
							props_quant: [], furni_quant: [],
							fav_shopID: [], event_coll: [],
							achievement_coll: [], chara_startTime: null,
							chara_coll: [], gameMode: false,
							gameObj: false, infoObj: false,
							decoration: []
						});
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

	user_basicInfo_update(name,pass,gameID,strength,intelligence,like,money,hour,level,callback){
		// var user_model = this.user_m;
		this.user_m.findOne({username: name, password: pass},'current_charID value_strength value_intelligence value_like value_money value_playTime_hr value_level'
			,function(err,match){
				if(err)
					callback(1,"internal error");
				else{
					if(match == null){
						// not found this user 
						callback(1,"illegal account");
					}else{
						match.current_charID = gameID;
						match.value_strength = strength;
						match.value_intelligence = intelligence;
						match.value_like = like;
						match.value_money = money;
						match.value_playTime_hr = hour;
						match.value_level = level;
						// saving 
						match.save(function(err,match){
							if(err)
								callback(1,"internal error");
							else
								callback(0,"success");
						});
					}
				}
			});
	}

	user_props_insertORupdate(name,pass,props_quant_array,callback){
		this.user_m.findOne({username: name, password: pass},'props_quant',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					callback(1,"illegal account");
				}
				else{
					// append 
					if(props_quant_array.length == 1){
						let in_index = match.props_quant.findIndex(i => i.id === props_quant_array[0].id);
						if(in_index == -1)
							match.props_quant.push(props_quant_array[0]); // push this element
						else
							match.props_quant[in_index] = props_quant_array[0]; // update
					}
					else{
						// concat array / insert array
						for(var a_index in props_quant_array){
							let in_index = match.props_quant.findIndex(i => i.id === props_quant_array[a_index].id);
							if(in_index == -1)
								match.props_quant.push(props_quant_array[a_index]);
							else
								match.props_quant[in_index] = props_quant_array[a_index];
						}
					}
					// deal saving
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else
							callback(0,"success");
					});
				}
			}
		});
	}

	user_props_delete(name,pass,props_quant_array,callback){
		this.user_m.findOne({username: name, password: pass},'props_quant',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					callback(1,"illegal account");
				}
				else{
					let checksum = 0;
					if(props_quant_array.length == 1){
						// get elements index
						let de_index = match.props_quant.findIndex(i => i.id === props_quant_array[0].id);
						// delete
						if(de_index != -1){
							match.props_quant.splice(de_index,1); 
							checksum++;
						}
					}
					else{
						// delete total array
						for(var a_index in props_quant_array){
							let de_index = match.props_quant.findIndex(i => i.id === props_quant_array[a_index].id );
							if(de_index != -1){
								match.props_quant.splice(de_index,1);
								checksum++;
							}
						}
					}
					// result
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else{
							// checking mechanism
							if(checksum != props_quant_array.length){
								callback(0,"not complete");
							}
							else{
								callback(0,"success");
							}
						}
					});
				}
			}
		});
	}

	user_furni_insertORupdate(name,pass,furni_quant_array,callback){
		this.user_m.findOne({username: name, password: pass},'furni_quant',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					callback(1,"illegal account");
				}
				else{
					// append 
					if(furni_quant_array.length == 1){
						let in_index = match.furni_quant.findIndex(i => i.id === furni_quant_array[0].id);
						if(in_index == -1)
							match.furni_quant.push(furni_quant_array[0]); // push this element
						else
							match.furni_quant[in_index] = furni_quant_array[0]; // update
					}
					else{
						// concat array / insert array
						for(var a_index in furni_quant_array){
							let in_index = match.furni_quant.findIndex(i => i.id === furni_quant_array[a_index].id);
							if(in_index == -1)
								match.furni_quant.push(furni_quant_array[a_index]);
							else
								match.furni_quant[in_index] = furni_quant_array[a_index];
						}
					}
					// deal saving
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else
							callback(0,"success");
					});
				}
			}
		});
	}

	user_furni_delete(name,pass,furni_quant_array,callback){
		this.user_m.findOne({username: name, password: pass},'furni_quant',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					callback(1,"illegal account");
				}
				else{
					let checksum = 0;
					if(furni_quant_array.length == 1){
						// get elements index
						let de_index = match.furni_quant.findIndex(i => i.id === furni_quant_array[0].id);
						// delete
						if(de_index != -1){
							match.furni_quant.splice(de_index,1); 
							checksum++;
						}
					}
					else{
						// delete total array
						for(var a_index in furni_quant_array){
							let de_index = match.furni_quant.findIndex(i => i.id === furni_quant_array[a_index].id );
							if(de_index != -1){
								match.furni_quant.splice(de_index,1);
								checksum++;
							}
						}
					}
					// result
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else{
							// checking mechanism
							if(checksum != furni_quant_array.length){
								callback(0,"not complete");
							}
							else{
								callback(0,"success");
							}
						}
					});
				}
			}
		});
	}

	user_favShop_set(name,pass,favShop_list,callback){
		this.user_m.findOne({username: name,password: pass},'fav_shopID',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					callback(1,"illegal account");
				}
				else{
					// setting 
					match.fav_shopID = favShop_list;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else
							callback(0,"success");
					});
				}
			}
		});
	}

	user_eventColl_set(name,pass,eventColl_list,callback){
		this.user_m.findOne({username: name, password: pass},'event_coll',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null)
					callback(1,"illegal account");
				else{
					// setting 
					match.event_coll = eventColl_list;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else 
							callback(0,"success");
					});
				}
			}
		});
	}

	user_achieveColl_set(name,pass,achieveColl_list,callback){
		this.user_m.findOne({username: name, password: pass},'achievement_coll',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null)
					callback(1,"illegal account");
				else{
					// setting 
					match.achievement_coll = achieveColl_list;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else 
							callback(0,"success");
					});
				}
			}
		});
	}

	user_charaColl_set(name,pass,charaColl_list,callback){
		this.user_m.findOne({username: name, password: pass},'chara_coll',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null)
					callback(1,"illegal account");
				else{
					// setting 
					match.chara_coll = charaColl_list;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else 
							callback(0,"success");
					});
				}
			}
		});
	}

	user_streetView_set(name,pass,modeFlag,objFlag,infoFlag,callback){
		this.user_m.findOne({username: name, password: pass},'gameMode gameObj infoObj',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null)
					callback(1,"illegal account");
				else{
					// setting 
					match.gameMode = modeFlag;
					match.gameObj = objFlag;
					match.infoObj = infoFlag;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else 
							callback(0,"success");
					});
				}
			}
		});
	}

	user_decoration_record(name,pass,decoration_record,callback){
		this.user_m.findOne({username: name, password: pass},'decoration',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null)
					callback(1,"illegal account");
				else{
					// setting 
					match.decoration = decoration_record;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else 
							callback(0,"success");
					});
				}
			}
		});
	}

	shopkeeper_register(name,pass,email,shopName,shopAddress,phone,category_1,category_2,shop_principal,shop_principal_gender,shop_principal_phone,shop_principal_email,callback){
		var owner_model = this.owner_m;
		this.owner_m.findOne({shopID:name},'',function(err,match){
				if(err){
					callback(1,"internal error");
				}
				else{
					if(match == null){
						// test shopName is unique or not
						owner_model.findOne({shopName: shopName},'',function(err,dup){
							if(err){
								callback(1,"internal error");
							}
							else{
								if(dup == null){
									// not found => this account legal, create one
									let newOwner = new owner_model({shopID:name,password:pass,email:email,shopName:shopName,phone:phone,
											updateTime: moment().format('lll'), problemReport: [],
											shop_category_1:category_1,shop_category_2:category_2,shop_principal:shop_principal,
											shop_principal_email:shop_principal_email,shop_principal_gender:shop_principal_gender,
											shop_principal_phone:shop_principal_phone,tmp: null});
									newOwner.save(function(s_err,newOwner){
										if(s_err){
											callback(1,"internal error");
										}
										else{
											callback(0,"success");
										}
									});
								}
								else{
									callback(1,"duplicate shopName");
								}
							}
						});
					}
					else{
						// existed
						callback(1,"duplicated shopID");
					}
				}
			});
	}

	shopInfo_update(shopID,password,shopName,shopAddress,openTime,infoList,callback){
		// using shopName to fetch
		var shop_model = this.shop_m;
		// verified 
		this.owner_m.findOne({shopID: shopID, password: password},'',function(v_err,v_match){
			if(v_err)
				callback(1,"internal error");
			else{
				if(v_match == null){
					// not found, => illegal
					callback(1,"illegal account");
				}
				else{
					// this account existed, update info
					shop_model.findOne({shopID: shopID, shopName: shopName},'',function(err,match){
						if(err)
							callback(1,"internal error");
						else{
							if(match == null){
								// not found , and create 
								let newInfo = new shop_model({shopID: shopID,shopName: shopName,
									shopAddress: shopAddress,openTime: openTime,infoList: infoList});
								newInfo.save(function(err,newInfo){
									if(err)
										callback(1,"internal error");
									else
										callback(0,"success");
								});
							}
							else{
								// existed, and then update
								match.shopAddress = shopAddress;
								match.openTime = openTime;
								match.infoList = infoList;
								match.save(function(err,match){
									if(err)
										callback(1,"internal error");
									else{
										callback(0,"success");
									}
								});
							}
						}
					});
				}
			}
		});
	}

	shopInfo_download(shopID,callback){
		this.shop_m.findOne({shopID: shopID},'shopName shopAddress openTime infoList',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					// not found 
					callback(1,"not found");
				}
				else{
					// found 
					callback(0,match);
				}
			}
		});
	}

	shopName2shopID(shopName,callback){
		this.owner_m.findOne({shopName: shopName},'shopID',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					// not found 
					callback(1,"not found");
				}
				else{
					// found !
					callback(0,match.shopID);
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

	shopkeeper_login(name,pass,callback){
		this.owner_m.findOne({shopID: name,password: pass},'',function(err,match){
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

	shopkeeper_fetch(shopID,callback){
		this.owner_m.findOne({shopID: shopID},
			'email shopName phone updateTime problemReport shop_category_1 shop_category_2 shop_principal shop_principal_gender shop_principal_phone shop_principal_email',
			function(err,match){
				if(err){
					callback(1,"internal error");
				}
				else{
					if(match == null){
						// not found
						callback(1,"wrong shopID");
					}
					else{
						// found this shop, and then return instance
						callback(0,match);
					}
				}
			});
	}

	user_fetch(username,callback){
		this.user_m.findOne({username: name},'username email',function(err,match){
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

	shopkeeper_gettmpcode(name,callback){
		// generate the verify code and append to target owner
		this.owner_m.findOne({shopID: name},'shopID password email tmp',function(err,match){
			if(err){
				callback(1,"internal error");
			}
			else{
				if(match == null){
					// not found
					callback(1,"wrong shopID");
				}
				else{
					// found this owner, and then generate random code
					var code = rs.generate({
						length: 12,
						charset: 'alphabetic'
					});
					match.tmp = code;
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else{
							callback(0,{
								email: match.email,
								code: code
							});
						}
					});
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
					match.save(function(err,match){
						if(err)
							callback(1,"internal error");
						else
							callback(0,{
								email: match.email,
								code: code
							});
					});
				}
			}
		});
	}

	shopkeeper_verify(name,code,callback){
		this.owner_m.findOne({shopID: name, tmp: code},'password email',function(err,match){
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

	shopkeeper_checkmail(email,callback){
		this.owner_m.findOne({email: email},'shopID',function(err,match){
			if(err)
				callback(1,"internal error");
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
	// about comment 
	add_comment(userID,shopID,content,picture,time,score,callback){
		var comm_model = this.comm_m;
		this.comm_m.findOne({userID: userID,shopID: shopID},'',function(err,match){
			if(err)
				callback(1,"internal error");
			else{
				if(match == null){
					// not found -> legal
					let newComm = new comm_model({ userID: userID,shopID: shopID,
						text_content: content, picture: picture, time: time, score: score}); // => FIXME: picture need to be modify
					newComm.save(function(s_err,newComm){
						if(s_err)
							callback(1,"internal error");
						else{
							callback(0,"success");
						}
					});
				}
				else{
					// you have been comment before! 
					// FIXME: add new one? update?
					callback(1,"duplicated");
				}
			}
		});
	}

	get_comments(shopID,callback){
		this.comm_m.find({shopID: shopID},'userID shopID text_content picture time score',function(err,matchs){
			if(err)
				callback(1,"internal error");
			else{
				if(matchs == null){
					callback(1,"none");
				}
				else{
					callback(0,matchs); // return all entries
				}
			}
		});
	}

	// dealing with adf fetch/set
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