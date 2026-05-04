const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4477', {
    origin: 'https://evil.com'
});

ws.on('open', () => {
    console.log('Connected to WebSocket server successfully (VULNERABLE!)');
    process.exit(0);
});

ws.on('error', (err) => {
    console.log('WebSocket connection failed:', err.message);
    if (err.message.includes('403')) {
        console.log('Server rejected connection properly (SECURE)');
    }
    process.exit(0);
});
