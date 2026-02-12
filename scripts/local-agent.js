import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

const PORT = Number(process.env.THEMAG_AGENT_PORT || 4477);

const wss = new WebSocketServer({ port: PORT });

console.log(`TheMAG.dev local agent listening on ws://localhost:${PORT}`);

wss.on('connection', (ws, req) => {
  // Security Check: Validate Origin to prevent CSWSH attacks
  const origin = req.headers.origin;
  const isAllowed = (origin) => {
    if (!origin) return false; // Block requests without Origin header

    // Allow exact matches for production domains
    if (origin === 'https://themag.dev' || origin === 'https://www.themag.dev') return true;

    // Allow localhost/127.0.0.1 on any port for local development
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
    } catch {
      return false;
    }

    return false;
  };

  if (!isAllowed(origin)) {
    console.log(`[Security] Blocked connection from unauthorized origin: ${origin || 'unknown'}`);
    ws.close();
    return;
  }

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
