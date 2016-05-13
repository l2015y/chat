var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var users = {};


app.get('/', function(req,res){
    var file = new fs.ReadStream('index.html');
    sendFile(file,res);
});

function sendFile(file,res){
    file.pipe(res);
    file.on('error',function(err){
        res.statusCode=500;
        res.end('Server error');
        console.error(err);
    });
    file.on('close', function(){
        file.destroy();
    });
};

   io.on('connection',function(socket) {
       console.log('a user connected');
       socket.on('join',function(data,callback) {
           if (data in users) {
               callback(false);
           } else {
               callback(true);
               socket.nickname = data;
               users[socket.nickname] = socket;
               updateNickname();
           }
       });

       function updateNickname(){
           io.sockets.emit('usernames', Object.keys(users));
       }


        socket.on('is typing',function(data){
           socket.broadcast.emit("typing",socket.nickname + ' is typing a message now ');
       });

       socket.on('chat message', function (data,callback) {
           var msg = data.trim();
           if(msg.substr(0,3) === '/w '){
               msg = msg.substr(3);
               var ind = msg.indexOf(' ');
               if(ind !== -1){
                   var name = msg.substring(0, ind);
                   var msg = msg.substring(ind + 1);
                   if(name in users){
                       users[name].emit('whisper', socket.nickname, msg);
                   } else{
                       callback('Error!  Enter a valid user.');
                   }
               } else{
                   callback('Error!  Please enter a message for your whisper.');
               }
           } else {
               socket.broadcast.emit("chat message", socket.nickname, msg);
               socket.emit("chat message", socket.nickname, msg);
           }
       });

       socket.on('disconnect', function(data){
           if(!socket.nickname) return;
           delete users[socket.nickname];
           updateNickname();
       });

       });
http.listen(3000, function () {
    console.log('listening *:3000')
});




