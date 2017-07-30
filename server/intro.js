class IntroService{
	init(app){
		app.get('/',this.landingPage);
	}
	landingPage(req,res){
		res.end("OK!");
	}
}

module.exports = {
	IntroService: new IntroService()
}