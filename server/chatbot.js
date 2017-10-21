// Communicate with chatbot/chatbot.py
const path = require('path');

var dataString;

class chatBot{
	constructor(){
		dataString = "";
	}

	train(query_str,callback){
		var exec = require('child_process').exec;
		exec('python ' + __dirname + '/chatbot/chatbot_trainer.py ' + '"' + query_str + '"' ,function(err,stdout,stderr){
			if(err != null){
				callback(1,stderr);
			}
			else{
				callback(0,stdout);
			}
		});
	}
	
	commute(query_str,callback){
		// create process to run program
		var exec = require('child_process').exec;
		// execute the running program
		exec('python ' + __dirname + '/chatbot/chatbot.py ' + '"' + query_str + '"' ,function(err,stdout,stderr){
			if(err != null){
				callback(1,stderr);
			}
			else{
				callback(0,stdout);
			}
		});
	}
}

module.exports = {
	chatBot : new chatBot()
}