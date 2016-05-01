var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var people = {};


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
       socket.on('join',function(name){
               people[socket.id] = name;
               console.log(people);
               socket.broadcast.emit("join", name);
               socket.emit("join", name);
               socket.emit("notice", "You have connected to the server.");
               socket.broadcast.emit("notice", name + " has joined the server.");

       });
        socket.on('is typing',function(data){
           socket.broadcast.emit("typing",people[socket.id] + ' is typing a message now ');
       });
       socket.on('chat message', function (msg) {
           socket.broadcast.emit("chat message",people[socket.id], msg);
           socket.emit("chat message",people[socket.id], msg);
       });
       socket.on("disconnect", function () {
           socket.broadcast.emit('notice', people[socket.id] + ' has left the chat.');
           delete people[socket.id];
           console.log('user disconnected');
       });

       });
http.listen(3000, function () {
    console.log('listening *:3000')
});
global.people = people;



