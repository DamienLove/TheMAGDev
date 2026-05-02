const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:4477', { origin: 'https://evil.com' });
ws.on('open', () => {
  console.log('Connected successfully! Vulnerable.');
  ws.close();
});
ws.on('error', (err) => {
  console.log('Connection failed:', err.message);
});
ws.on('unexpected-response', (req, res) => {
  console.log('Rejected with status:', res.statusCode);
});
