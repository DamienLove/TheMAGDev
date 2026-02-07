const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const http = require('http');

const PORT = Number(process.env.THEMAG_AGENT_PORT || 4477);

// Allowed origins to prevent CSWSH attacks
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://themag.dev',
  'https://www.themag.dev'
];

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const origin = request.headers.origin;

  if (ALLOWED_ORIGINS.includes(origin)) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    console.log(`[Security] Blocked connection from origin: ${origin}`);
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`TheMAG.dev local agent listening on ws://localhost:${PORT}`);
});

wss.on('connection', (ws) => {
  let cwd = process.cwd();
  let currentProcess = null;

  const send = (payload) => ws.send(JSON.stringify(payload));

  send({ type: 'ready', cwd });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'run') {
      const command = String(msg.command || '').trim();
      if (!command) return;

      if (command === 'pwd') {
        send({ type: 'output', data: `\r\n${cwd}\r\n` });
        return;
      }

      if (command === 'clear') {
        send({ type: 'output', data: '' });
        return;
      }

      if (command === 'cd' || command.startsWith('cd ')) {
        const target = command === 'cd' ? os.homedir() : command.slice(3).trim();
        const next = target.startsWith('~')
          ? path.join(os.homedir(), target.slice(1))
          : path.resolve(cwd, target);
        cwd = next;
        send({ type: 'cwd', cwd });
        return;
      }

      if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
      }

      currentProcess = spawn(command, {
        shell: true,
        cwd,
        env: process.env,
      });

      currentProcess.stdout.on('data', (data) => {
        send({ type: 'output', data: data.toString() });
      });

      currentProcess.stderr.on('data', (data) => {
        send({ type: 'output', data: data.toString() });
      });

      currentProcess.on('close', (code) => {
        send({ type: 'exit', code });
        currentProcess = null;
      });
    }

    if (msg.type === 'input' && currentProcess?.stdin) {
      currentProcess.stdin.write(String(msg.data || ''));
    }

    if (msg.type === 'kill' && currentProcess) {
      currentProcess.kill();
      currentProcess = null;
    }
  });
});
