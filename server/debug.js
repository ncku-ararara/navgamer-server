const path = require('path');
const formidable = require('formidable');
const { DB } = require('./db');
const { chatBot } = require('./chatbot');

class Debugger {
	init(app){
		// define debug url work here 
		app.post('/test',this.test);
		// upload debug
		app.post('/de_upload',this.de_upload);
		// chatbot testing 
		app.get('/chatbot',this.chatbot);
		// chatbot training 
		app.get('/chatbot_training',this.chatbot_training)
	}
	
	test(req,res){
		// body name: "username","password"
		console.log(`[Debug] Username: ${req.body.username}, Password: ${req.body.password}`);
		res.end("Debug info get!");
	}
	
	de_upload(req,res){
		// testing upload usage
		res.end("Working");
	}
	
	chatbot(req,res){
		chatBot.commute(req.query.str,function(err,data){
			if(err){
				res.status(500).send(data);
			}
			else{
				console.log("Get Result: " + data);
				res.set({ 'content-type': 'application/json; charset=utf-8' }); // ensure encoding format is right
				res.end(data); // only response goes here
			}
		});
	}

	chatbot_training(req,res){
		chatBot.train(req.query.str,function(err,data){
			if(err){
				res.status(500).send(data);
			}
			else{
				console.log("Get Result: " + data);
				res.set({ 'content-type': 'application/json; charset=utf-8' }); // ensure encoding format is right
				res.end(data); // only response goes here
			}
		});
	}
}

module.exports = {
	Debugger: new Debugger()
}