import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import process from 'process';

// Converted to ESM to support "type": "module" in package.json
// Originally this file used require() which caused a ReferenceError.

const PORT = Number(process.env.THEMAG_AGENT_PORT || 4477);

const wss = new WebSocketServer({
  port: PORT,
  verifyClient: (info, cb) => {
    const origin = info.req.headers.origin;

    // Block requests without Origin header (strict security for web-based agent)
    if (!origin) {
      console.log('Blocked connection with no Origin header');
      cb(false, 403, 'Forbidden');
      return;
    }

    try {
      const url = new URL(origin);
      const hostname = url.hostname;

      // Allow localhost and 127.0.0.1 (any port)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        cb(true);
        return;
      }

      // Allow themag.dev and subdomains
      if (hostname === 'themag.dev' || hostname.endsWith('.themag.dev')) {
        cb(true);
        return;
      }

      // Allow stackblitz.io (for webcontainers/demos)
      if (hostname === 'stackblitz.io' || hostname.endsWith('.stackblitz.io')) {
        cb(true);
        return;
      }

    } catch (e) {
      // Invalid URL in Origin, fall through to block
    }

    console.log(`Blocked connection from origin: ${origin}`);
    cb(false, 403, 'Forbidden');
  }
});

console.log(`TheMAG.dev local agent listening on ws://localhost:${PORT}`);

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
