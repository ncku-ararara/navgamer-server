// handle about socket io usage

class IOService{
	init(app){
		app.get('/chatroom',this.openChat);
	}
	
	openChat(req,res){
		console.log(`[IO Service] Open chatbot room for usage; Channel: ${req.query.room_name}, Username: ${req.query.name}`);
		if(req.query.room_name == undefined || req.query.name == undefined){
			res.end("Please read the /doc to have correct pathname usage!");
		}
		// res.set({ 'content-type': 'application/json; charset=utf-8' }); // ensure encoding format is right
		res.render('chatroom',{
			title: "KevinBOT",
			room_name: req.query.room_name,
			username: req.query.name
		});
	}
}

module.exports = {
	IOService: new IOService()
}