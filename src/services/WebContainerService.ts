import { WebContainer } from '@webcontainer/api';

export interface FileSystemTree {
  [name: string]: {
    file?: { contents: string };
    directory?: FileSystemTree;
  };
}

export type TerminalOutput = (data: string) => void;

class WebContainerService {
  private container: WebContainer | null = null;
  private isBooting = false;
  private bootPromise: Promise<WebContainer> | null = null;
  private outputCallback: TerminalOutput | null = null;
  private currentProcess: any = null;

  async boot(): Promise<WebContainer> {
    if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
      throw new Error('WebContainer requires cross-origin isolation (COOP/COEP). Use Mock/Local mode.');
    }

    if (this.container) {
      return this.container;
    }

    if (this.bootPromise) {
      return this.bootPromise;
    }

    this.isBooting = true;
    this.bootPromise = WebContainer.boot();

    try {
      this.container = await this.bootPromise;
      this.isBooting = false;

      // Mount a basic file system
      await this.container.mount({
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: 'themag-workspace',
              version: '1.0.0',
              type: 'module',
              scripts: {
                dev: 'echo "Development server would start here"',
                build: 'echo "Build would run here"',
                test: 'echo "Tests would run here"'
              },
              dependencies: {}
            }, null, 2)
          }
        },
        'README.md': {
          file: {
            contents: '# TheMAG.dev Workspace\n\nWelcome to your WebContainer workspace!\n\nYou can run Node.js commands, npm, and more.\n'
          }
        },
        'index.js': {
          file: {
            contents: 'console.log("Hello from TheMAG.dev WebContainer!");\n'
          }
        },
        'src': {
          directory: {
            'main.ts': {
              file: {
                contents: '// Your TypeScript code here\nconsole.log("TypeScript ready!");\n'
              }
            }
          }
        }
      });

      return this.container;
    } catch (error) {
      this.isBooting = false;
      this.bootPromise = null;
      throw error;
    }
  }

  isReady(): boolean {
    return this.container !== null && !this.isBooting;
  }

  isBooting_(): boolean {
    return this.isBooting;
  }

  setOutputCallback(callback: TerminalOutput) {
    this.outputCallback = callback;
  }

  private write(data: string) {
    if (this.outputCallback) {
      this.outputCallback(data);
    }
  }

  async runCommand(command: string, options?: { cwd?: string; onOutput?: (data: string) => void }): Promise<number> {
    if (!this.container) {
      throw new Error('WebContainer not initialized. Call boot() first.');
    }

    const args = command.trim().split(/\s+/);
    const cmd = args[0];
    const cmdArgs = args.slice(1);

    // Handle built-in shell commands
    if (cmd === 'cd') {
      const msg = `\r\nNote: cd is handled at shell level\r\n`;
      if (options?.onOutput) options.onOutput(msg);
      else this.write(msg);
      return 0;
    }

    if (cmd === 'clear') {
      return 0;
    }

    if (cmd === 'pwd') {
      const msg = `\r\n/home/project\r\n`;
      if (options?.onOutput) options.onOutput(msg);
      else this.write(msg);
      return 0;
    }

    if (cmd === 'echo') {
      const msg = `\r\n${cmdArgs.join(' ')}\r\n`;
      if (options?.onOutput) options.onOutput(msg);
      else this.write(msg);
      return 0;
    }

    try {
      // Spawn the process
      const process = await this.container.spawn(cmd, cmdArgs, options?.cwd ? { cwd: options.cwd } : undefined);
      this.currentProcess = process;

      // Handle output
      process.output.pipeTo(
        new WritableStream({
          write: (data) => {
            if (options?.onOutput) {
              options.onOutput(data);
            } else {
              this.write(data);
            }
          }
        })
      );

      // Wait for the process to exit
      const exitCode = await process.exit;
      this.currentProcess = null;
      return exitCode;
    } catch (error: any) {
      this.write(`\r\n\x1b[31mError: ${error.message}\x1b[0m\r\n`);
      return 1;
    }
  }

  async writeInput(data: string) {
    if (this.currentProcess?.input) {
      const writer = this.currentProcess.input.getWriter();
      await writer.write(data);
      writer.releaseLock();
    }
  }

  async killCurrentProcess() {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }

  async writeFile(path: string, contents: string): Promise<void> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    await this.container.fs.writeFile(path, contents);
  }

  async readFile(path: string): Promise<string> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    return await this.container.fs.readFile(path, 'utf-8');
  }

  async readDir(path: string): Promise<string[]> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    return await this.container.fs.readdir(path);
  }

  async mkdir(path: string): Promise<void> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    await this.container.fs.mkdir(path, { recursive: true });
  }

  async rm(path: string): Promise<void> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    await this.container.fs.rm(path, { recursive: true });
  }

  async mount(files: FileSystemTree): Promise<void> {
    if (!this.container) {
      throw new Error('WebContainer not initialized');
    }
    await this.container.mount(files);
  }

  getContainer(): WebContainer | null {
    return this.container;
  }

  async teardown() {
    if (this.currentProcess) {
      await this.killCurrentProcess();
    }
    if (this.container) {
      this.container.teardown();
      this.container = null;
      this.bootPromise = null;
    }
  }
}

export const webContainerService = new WebContainerService();
export default webContainerService;
