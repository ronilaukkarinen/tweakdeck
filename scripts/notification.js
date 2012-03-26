var ports = [];
onconnect = function(e) {
    var port = e.ports[0];
    ports.push(port);

    port.onmessage = function(e) {
        var numPorts = ports.length;
        var i;

        for (i=0; i<numPorts; i++) {
            // Don't send the message back to the connection which sent it to us!
            ports[i].postMessage(e.data); // Forward the message out to all listeners.
        };
    };
};
