const WebSocket = require('ws');
const readline = require('readline');

const wss = new WebSocket.Server({ port: 8082 });

// Object to store connected clients and their chat rooms
const clients = {};

wss.on('connection', (ws) => {
    console.log('A new client connected');

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });

    ws.send(JSON.stringify({ type: 'connected' }));

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);

        const data = JSON.parse(message);
        const { type, content, room } = data;

        if (type === 'join') {
            // Join a chat room
            ws.room = room;
            clients[room] = clients[room] || [];
            clients[room].push(ws);
            console.debug(`Client joined room: ${room}`);
        } else if (type === 'message') {
            // Broadcast the message to all clients in the same chat room
            const roomClients = clients[ws.room];
            if (roomClients) {
                roomClients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(content);
                        console.debug(`Sent message to client in room: ${ws.room}`);
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');

        // Remove the client from the chat room
        if (ws.room && clients[ws.room]) {
            clients[ws.room] = clients[ws.room].filter(client => client !== ws);
            console.debug(`Client removed from room: ${ws.room}`);
        }
    });
});

console.log('WebSocket server is running on port 8082');

// Read input from the terminal and send it as a message to the connected clients
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    // Create a message object
    const message = {
        type: 'message',
        content: input
    };

    // Broadcast the message to all clients in the chat room
    Object.values(clients).forEach(roomClients => {
        roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
                console.debug(`Sent message to client in room: ${client.room}`);
            }
        });
    });
});