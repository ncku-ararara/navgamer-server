const io = require('socket.io');
const path = require('path');
const jsfs = require('jsonfile');
const { chatBot } = require('./chatbot');

class IO{
	init(server){
		// Create Web Socket Server
		this.io = new io().listen(server);
		// Maintain channel list 
		this.channel_list = [];
		
		// Binding 
		var self = this;
		
		// Listening
		this.io.sockets.on('connection',function(socket){
			// using join by specific room name
			socket.on("join",function(info){
				console.log(`[IO] Room ID: ${info.room_name}; Join Room request send from: ${socket.request.connection.remoteAddress};`);
				socket.room_name = info.room_name;
				self.channel_list.push({
					room_name: info.room_name,
					time: null
				});
				// join the channel by room_name 
				socket.join(info.room_name);
			}); // join 
			// dealing with disconnect event
			socket.on("disconnect",function(){
				console.log(`[IO] Room ID: ${socket.room_name}; Leaving Room request send from: ${socket.request.connection.remoteAddress};`);
				socket.leave(socket.room_name);
				self.channel_list.splice(self.channel_list.indexOf(socket.room_name),1);
			}); // disconnect 
			// chat 
			socket.on("chat",function(rawdata){
				console.log(`[IO] Sender: ${rawdata.who}; Content: ${rawdata.content}; \r\nMessage broadcast in channel: ${socket.room_name}`);
				// commute with chatbot
				chatBot.commute(rawdata.content,function(err,data){
					// add the chatbot response
					if(err){
						
					}
					else{
						self.io.in(socket.room_name).emit('new_msg',{
							who: rawdata.who,
							content: rawdata.content
						});
						// send the bot saying 
						self.io.in(socket.room_name).emit('new_msg',{
							who: "KevinBOT",
							content: data
						});
					}
				});
			}); // chat
		}); // Web socket listening
	}
}

module.exports = {
	IO: new IO()
}