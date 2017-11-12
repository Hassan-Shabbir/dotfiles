/* Copyright RescueTime, Inc. 2017
 * "Brian Arenz" <brianarenz@rescuetime.com>
*/

// require RescueTimeUtil
// require RescueTimeLocalStorage
// require RescueTimeConfig

var RescueTimeWebSocket = {
  storage: null,
  config: null,
  util: null,
  socket: null,
  connected: false,
  protocolVersion: 1,
  host: 'ws://127.0.0.1',
  portIndex: 0,
  portsAvailable: [
    8082, 16587, 19968, 16485, 2961, 62743, 22832, 3900,
    7394, 58293, 23552, 20085, 18278, 26078, 61230, 18814,
    35556, 33153, 62463, 32969, 38999, 13813, 29096, 58838,
    26223, 18535, 15351, 52270, 30994, 21143, 34095, 7271
  ],

  messageIds: Object.freeze({
    initialize:   0,
    validate:     1,
    url:          2,
    redirect:     3
  }),

  initialize: function(config) {
    this.config = config;
    this.util = config.util;
    this.storage = config.storage;

    return this;
  },

  //////////////
  // Connections
  connect: function(){

    if(this.shouldConnect()){
      this.util._log('WebSocket connecting');

      var self = this,
          currentPort = self.portsAvailable[self.portIndex],
          hostUri = self.host + ':' + currentPort + '?from=rtext';

      self.socket = new WebSocket(hostUri);

      //// Events
      self.socket.addEventListener('open', function(event){
        self.util._log('WebSocket initializing connection');
        var opts = {
          message_id: self.messageIds['initialize'],
          protocol_version: self.protocolVersion,
          account_key: self.config.common.account_key
        }

        self.sendMessage(opts);
      });

      self.socket.addEventListener('message', function(msg){
        self.util._log('WebSocket message received');

        var message = JSON.parse(msg.data);
        self.getMessageCallback(message);
      });

      self.socket.addEventListener('error', function(err){
        self.util._log('WebSocket ERROR');
      });

      self.socket.addEventListener('close', function(res){
        self.util._log('WebSocket disconnected');
        self.connected = false;
        self.reconnect(res);
      });
    }
  },

  disconnect: function(){
    this.portIndex = 0;
    if(this.socket !== null){
      this.socket.close();
    }
  },

  reconnect: function(res){
    this.socket = null;
    this.portIndex++;

    if(this.portIndex < this.portsAvailable.length){
      this.connect();
    } else {
      this.util._log('WebSocket all ports scanned');
      this.portIndex = 0;
    }
  },

  shouldConnect: function(){
    var enabled = this.config.getConfigData('local_logging_enabled');

    if ((this.config.hasAccountKey()) && (this.connected === false) &&
        (enabled !== null) && ((enabled === false) || (enabled === 'false')) &&
        (this.connectionBusy() === false)){
          return true;
    }

    return false;
  },

  connectionBusy: function(){
    if(this.socket !== null){
      if([0,2].indexOf(this.socket.readyState) !== -1){
        return true;
      }
    }

    return false;
  },

  ////////////
  // Messaging
  sendMessage: function(obj){
    if(this.connectionBusy() === false){
      if(this.socket !== null){
        this.util._log('WebSocket sending');

        this.socket.send(JSON.stringify(obj));
      } else {
        this.connect();
      }
    }
  },

  getMessageCallback: function(msg){
    var self = this,
        callbackName = Object.keys(self.messageIds).filter(function(key){ return self.messageIds[key] === msg.message_id; })[0];

    if(typeof(callbackName) !== 'undefined'){
      self[callbackName](msg);
    }
  },

  //// Callbacks
  validate: function(msg){
    if(msg.hasOwnProperty('valid') && msg.hasOwnProperty('protocol_version')) {
      if(msg.valid !== true || (msg.protocol_version !== this.protocolVersion)) {
        this.disconnect();
      } else {
        this.util._log('WebSocket connection validated');
        this.connected = true;
      }
    } else {
      this.disconnect();
    }
  },

  redirect: function(msg){
    // for focustime
    if(msg.hasOwnProperty('url') && msg.hasOwnProperty('block_url')){

      var opts = {
        currentWindow: true,
        active: true,
        url: new URL(msg.url).toString()
      }

      chrome.tabs.query(opts, function(results){
        if(results.length && results[0].hasOwnProperty('id')){
          chrome.tabs.update(results[0].id, {url: msg.block_url});
        }
      });
    }
  }
};

var EXPORTED_SYMBOLS = ["RescueTimeWebSocket"];
