/// Create AirPointr object
/// onGesture: Gesture callback (default = null)
/// port: WebSocket port (default = 8081)
/// reconnect: Automatically reconnect (default = true)
var AirPointr = function (onGesture, port, reconnect) {
    onGesture = typeof onGesture !== 'undefined' ? onGesture : null;
    port = typeof port !== 'undefined' ? port : 8081;
    reconnect = typeof reconnect !== 'undefined' ? reconnect : true;
    
    // onGesture callback
    this.onGesture = onGesture;
    
    // port, its always localhost
    this.port = port;
    
    // reconnect if connection has been lost
    this.autoReconnect = reconnect;
    
    // WebSocket connection
    this.webSocket = null;
    
    // instance
    var instance = this;
    
    // private function
    this.tryConnect = function() {
        var host = "ws://localhost:" + instance.port;
        
        var webSocket = new WebSocket(host);
        
        // console.log("AirPointr, connecting to " + host + "...");
        
        webSocket.onopen = function() {
            // console.log("AirPointr opened.");
        }

        webSocket.onclose = function(event) {
            // console.log("AirPointr closed.");
            
            if(instance.autoReconnect) {
                // reconnect
                setTimeout(instance.tryConnect, 1000);
            }
        };

        webSocket.onerror = function(error) {
            // console.log("AirPointr failed with error = " + error + ".");
            
            webSocket.close();
        };
        
        // receive new data
        webSocket.onmessage = function(msg) {
            // some sockets only flush if data was sent
            webSocket.send('SOME_SOCKETS_NEED_DATA_TO_FLUSH');
            
            if(instance.onGesture) {
                var data = JSON.parse(msg.data);
                instance.onGesture(data);
            }
        };
        
        instance.webSocket = webSocket;
    };
};

/// Disconnect from the host.
AirPointr.prototype.disconnect = function() {
    if(this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
    }
    return this;
}

/// Connect to the host specified in the options.
AirPointr.prototype.connect = function() {
    if(!this.webSocket) {
        this.tryConnect();
    }
    return this;
}

/// Send message using the websocket.
/// message: Message to sent to AirPointr.
AirPointr.prototype.send = function(message) {
    if(this.webSocket &&
        // readyState === 1 : OPEN
        this.webSocket.readyState === 1) {
        this.webSocket.send(message);
    }
    return this;
}
