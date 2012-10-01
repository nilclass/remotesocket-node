
var http = require('http'), WebSocketServer = require('websocket').server;

var requestHandler = require('./src/request_handler');

var server = http.createServer(function(req, res) {
  res.writeHead(404);
  res.write("You've reached a proxy. You ain't welcome here.");
  res.end();
}).listen(8080, function() {
  console.log("Listening on port 8080");
});

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', requestHandler);
