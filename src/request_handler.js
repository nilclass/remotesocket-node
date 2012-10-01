
var net = require('net'), tls = require('tls');
var ConnectionHandler = require('./connection_handler');

module.exports = function(request) {

  
  var parts = request.resource.split('?'), path = parts[0], query = (parts[1] || '');
  var pathParts = path.split('/'), host = pathParts[1], port = Number(pathParts[2]);
  var options = {}, queryParts = query.split('&');
  for(var i=0;i<queryParts.length;i++) {
    var option = queryParts[i].split('='), key = decodeURIComponent(option[0]), value = decodeURIComponent(option[1]);
    options[key] = value;
  }

  options.ssl = (options.ssl === 'true');

  if(! (host && port)) {
    console.log("REJECT NO HOST & PORT");
    request.reject();
  }

  console.log('TRY ' + host + ':' + port, options, query);

  var handler = new ConnectionHandler(host, port);

  var tcpConnection = (options.ssl ? tls : net).connect(port, host);

  tcpConnection.on(options.ssl ? 'secureConnect' : 'connect', function() {

    if(options.ssl) {
      console.log("Certificate valid: ", tcpConnection.authorized);
    }

    var wsConnection = request.accept('tcp-stream-protocol');

    wsConnection.on('message', handler.wsData);

    wsConnection.on('close', handler.wsClose);

    wsConnection.on('error', handler.wsError);
    
    handler.tcpOpen(tcpConnection);
    handler.wsOpen(wsConnection);
    
  });

  tcpConnection.on('data', handler.tcpData);

  tcpConnection.on('close', handler.tcpClose);

  tcpConnection.on('error', function(error) {
    handler.tcpError(error);
    request.reject();
  });

}
