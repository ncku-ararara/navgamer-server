const path = require('path');
const formidable = require('formidable');
const { DB } = require('./db');

class Debugger {
	init(app){
		// define debug url work here 
		app.post('/test',this.test);
		// debug usage - setting 
		app.get('/adf_s',this.adf_s);
		app.get('/adf_g',this.adf_g);
		// download debug
		app.get('/de_download',this.de_download);
		// upload debug
		app.post('/de_upload',this.de_upload);
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
	
	adf_g(req,res){
		// fetch id to get download file path
		console.log(`[Debug] ID: ${req.query.id}`);
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
	
	/* Test database functionality */
	de_download(req,res){
		// testing download usage
		console.log(`[Debug] Download target adf file`);
		// get id 
		console.log(`[Debug] beacon id: {req.query.id}`);
		
		res.end("OK! Start getting download!");
	}
	
	de_upload(req,res){
		// testing upload usage
		res.end("Working");
	}
}

module.exports = {
	Debugger: new Debugger()
}