
var ConnectionHandler = function(host, port) {
  this.host = host, this.port = port;

  // strictly bind all methods.
  for(var key in this) {
    if(typeof(this[key]) === 'function') {
      this[key] = this[key].bind(this);
    }
  }
}

// all methods, but the helpers are installed as event handlers by requestHandler.
ConnectionHandler.prototype = {

  // open flags
  _tcpOpen: false,
  _wsOpen: false,
  // buffers
  _tcpBuf: [],
  _wsBuf: [],
  // connections
  _tcpCon: null,
  _wsCon: null,

  // OPEN
  tcpOpen: function(conn) { this._tcpOpen = true; this._tcpCon = conn; this.openCb(); },
  wsOpen: function(conn) { this._wsOpen = true; this._wsCon = conn; this.openCb(); },

  // CLOSE
  tcpClose: function() { this._tcpOpen = false; this.closeAll(); },
  wsClose: function() { this._wsOpen = false; this.closeAll(); },

  // DATA
  tcpData: function(data) {
    if(this.isOpened()) {
      this.wsSend(data);
    } else {
      this._tcpBuf.push(data);
    }
  },
  wsData: function(message) {
    var data = message.type === 'utf8' ? message.utf8Data : message.binaryData;
    if(this.isOpened()) {
      this.tcpSend(data);
    } else {
      this._wsBuf.push(data);
    }
  },

  // ERROR
  tcpError: function() {
    console.error("TCP ERROR", arguments);
  },
  wsError: function() {
    console.error("WEBSOCKET ERROR", arguments);
  },

  // SEND

  tcpSend: function(data) { this._tcpCon.write(data); },
  wsSend: function(data) { this._wsCon.sendUTF(data); },

  // HELPERS
  isOpened: function() { return this._tcpOpen && this._wsOpen; },
  openCb: function() {
    if(this.isOpened()) {

      console.log("ALL OPENED");

      // flush buffers
      if(this._tcpBuf.length > 0) {
        this._tcpBuf.forEach(this.wsSend);
        this._tcpBuf = [];
      }
      if(this._wsBuf.length > 0) {
        this._wsBuf.forEach(this.tcpSend);
        this._wsBuf = [];
      }
    }
  },
  closeAll: function() {
    if(this._tcpCon) {
      this._tcpCon.destroy();
      this._tcpCon = null;
    }
    if(this._wsCon) {
      this._wsCon.close();
      this._wsCon = null;
    }
    console.log("ALL CLOSED");
  }
}

module.exports = ConnectionHandler;
