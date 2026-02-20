const { WebSocketServer } = require('ws'); // Local Agent Server
const { spawn } = require('child_process');
const os = require('os');

const PORT = 4477;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://stackblitz.io',
  'https://themag.dev'
];

function verifyClient(info, cb) {
  const origin = info.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    cb(true);
  } else {
    console.log(`Blocked connection from unauthorized origin: ${origin}`);
    cb(false, 403, 'Forbidden');
  }
}

const wss = new WebSocketServer({ port: PORT, verifyClient });

console.log(`Local Agent running on ws://localhost:${PORT}`);
console.log('Waiting for connection...');

wss.on('connection', (ws) => {
    console.log('Client connected');

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const args = os.platform() === 'win32'
        ? ['-NoLogo', '-NoProfile']
        : [];

    console.log(`Spawning ${shell} with args:`, args);

    const pty = spawn(shell, args, {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Pipe stdout to WebSocket
    pty.stdout.on('data', (data) => {
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
            }
        } catch (e) {
            console.error('Error sending stdout:', e);
        }
    });

    // Pipe stderr to WebSocket
    pty.stderr.on('data', (data) => {
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'output', data: data.toString() }));
            }
        } catch (e) {
            console.error('Error sending stderr:', e);
        }
    });

    // Handle messages from client
    ws.on('message', (message) => {
        try {
            console.log('Received message:', message.toString()); // Debug log
            const payload = JSON.parse(message);
            // ...

            if (payload.type === 'input') {
                pty.stdin.write(payload.data);
            } else if (payload.type === 'resize') {
                // Basic resize support if we were using node-pty, but with raw spawn we can't easily resize.
                // Ignored for now.
            } else if (payload.type === 'kill') {
                pty.kill();
            }
        } catch (e) {
            console.error('Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        pty.kill();
    });

    pty.on('exit', (code) => {
        console.log(`Shell exited with code ${code}`);
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'exit', code }));
                ws.close();
            }
        } catch (e) {
            // ignore
        }
    });

    // Send ready signal
    ws.send(JSON.stringify({ type: 'ready', cwd: process.cwd() }));
});
