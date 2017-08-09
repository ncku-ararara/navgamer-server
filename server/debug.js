const path = require('path');
const formidable = require('formidable');
const { DB } = require('./db');
const { chatBot } = require('./chatbot');

class Debugger {
	init(app){
		// define debug url work here 
		app.post('/test',this.test);
		// debug usage - setting 
		app.get('/adf_s',this.adf_s);
		app.get('/adf_g',this.adf_g);
		// upload debug
		app.post('/de_upload',this.de_upload);
		// chatbot testing 
		app.get('/chatbot',this.chatbot);
	}
	
	test(req,res){
		// body name: "username","password"
		console.log(`[Debug] Username: ${req.body.username}, Password: ${req.body.password}`);
		res.end("Debug info get!");
	}
	
	adf_s(req,res){
		// set 
		DB.set_adf(req.query.id,req.query.path,req.query.loc,function(err,obj){
			if(err){
				res.end(err);
			}
			else{
				res.end(obj);
			}
		});
	}
	
	/* Test database functionality */
	adf_g(req,res){
		// fetch id to get download file path
		console.log(`[Debug] ID: ${req.query.id}`);
		console.log(`[Debug] Request Header: ${JSON.stringify(req.headers)}`);
		DB.get_adf(req.query.id,function(err,obj){
			if(err){
				res.end(err);
			}
			else{
				// find !
				console.log(`Get matching result! Path:${obj.path}, Location:${obj.location}`);
				// And then fetch the file for download (path from mongo must eliminate `"`)
				var file = path.join(__dirname,'..',obj.path.split('"').join(''));
				res.download(file);
			}
		});
	}
	
	de_upload(req,res){
		// testing upload usage
		res.end("Working");
	}
	
	chatbot(req,res){
		chatBot.commute(req.query.str,function(err,data){
			console.log("Get Result: " + data);
			res.set({ 'content-type': 'application/json; charset=utf-8' }); // ensure encoding format is right
			res.end("你說: " + req.query.str + "\r\nKevinBOT 說: "+data);
		});
	}
}

module.exports = {
	Debugger: new Debugger()
}