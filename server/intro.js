// For Introduction of NavGamer here
const config = require('./config');
const jsfs = require('jsonfile');
const path = require('path');

class IntroService{
	init(app){
		app.get('/',this.landingPage);
		app.get('/doc',this.docs);
	}
	landingPage(req,res){
		res.end("OK!");
	}
	docs(req,res){
		var api = jsfs.readFileSync(path.join(__dirname,'restful','api.json'));
		res.render("doc",{
			title: "NavGamer - Document Page",
			api: api
		});
	}
}

module.exports = {
	IntroService: new IntroService()
}