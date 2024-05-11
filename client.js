const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:8082');

ws.on('open', function open() {
    console.log('WebSocket client connected');

    // Send a message to the server
    ws.send(JSON.stringify({ type: 'join', room: 'testRoom' }));

    // Read input from the terminal and send it to the server
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', function (input) {
        ws.send(JSON.stringify({ type: 'custom', message: input }));
    });
});

ws.on('message', function incoming(message) {
    console.log('Received message:', message);
});

// Close the WebSocket connection after a few seconds (for testing)
setTimeout(function() {
    ws.close();
}, 5000);
