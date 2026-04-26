const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4477', { origin: 'http://localhost:5173' });
ws.on('open', () => {
    console.log('Connected to local agent from allowed origin!');
    ws.send(JSON.stringify({ type: 'input', data: 'echo SUCCESS\n' }));
    setTimeout(() => { ws.close(); process.exit(0); }, 500);
});
ws.on('message', (msg) => {
    console.log('Received:', msg.toString());
});
ws.on('error', (err) => {
    console.error('Error:', err.message);
});
