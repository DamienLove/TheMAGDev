const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4477', { origin: 'https://evil.com' });
ws.on('open', () => {
    console.log('Connected! CSWSH successful.');
    process.exit(1);
});
ws.on('error', (err) => {
    console.log('Error:', err.message);
    if (err.message.includes('403')) {
        console.log('CSWSH blocked!');
        process.exit(0);
    }
});
