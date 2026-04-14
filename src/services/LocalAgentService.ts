export type TerminalOutput = (data: string) => void;
export type AgentStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class LocalAgentService {
  private socket: WebSocket | null = null;
  private outputCallback: TerminalOutput | null = null;
  private statusCallback: ((status: AgentStatus) => void) | null = null;
  private cwdCallback: ((cwd: string) => void) | null = null;

  setOutputCallback(callback: TerminalOutput) {
    this.outputCallback = callback;
  }

  setStatusCallback(callback: (status: AgentStatus) => void) {
    this.statusCallback = callback;
  }

  setCwdCallback(callback: (cwd: string) => void) {
    this.cwdCallback = callback;
  }

  private emitOutput(data: string) {
    if (this.outputCallback) {
      this.outputCallback(data);
    }
  }

  private emitStatus(status: AgentStatus) {
    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  private emitCwd(cwd: string) {
    if (this.cwdCallback) {
      this.cwdCallback(cwd);
    }
  }

  connect(url = 'ws://localhost:4477'): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.emitStatus('connecting');
      try {
        const socket = new WebSocket(url);
        this.socket = socket;

        socket.onopen = () => {
          this.emitStatus('connected');
          resolve();
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data as string);
            if (payload.type === 'output') {
              this.emitOutput(payload.data);
            } else if (payload.type === 'cwd') {
              this.emitCwd(payload.cwd);
            } else if (payload.type === 'exit') {
              this.emitOutput(`\r\n[process exited ${payload.code}]\r\n`);
            } else if (payload.type === 'ready') {
              if (payload.cwd) {
                this.emitCwd(payload.cwd);
              }
            }
          } catch {
            this.emitOutput(event.data as string);
          }
        };

        socket.onerror = () => {
          this.emitStatus('error');
          reject(new Error('Local agent connection error'));
        };

        socket.onclose = () => {
          this.emitStatus('disconnected');
        };
      } catch (error) {
        this.emitStatus('error');
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.emitStatus('disconnected');
  }

  runCommand(command: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Local agent not connected');
    }
    this.socket.send(JSON.stringify({ type: 'run', command }));
  }

  writeInput(data: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    this.socket.send(JSON.stringify({ type: 'input', data }));
  }

  kill() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    this.socket.send(JSON.stringify({ type: 'kill' }));
  }
}

export const localAgentService = new LocalAgentService();
export default localAgentService;
