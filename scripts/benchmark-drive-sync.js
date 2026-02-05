
import { performance } from 'perf_hooks';

// Mock delays
const LATENCY = 50; // ms

// Mock helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MockDriveService {
  constructor() {
    this.files = new Map(); // id -> content
    this.names = new Map(); // name -> id
    this.nextId = 1;
    this.syncStatus = { syncedFiles: 0 };
  }

  notifyListeners() {}

  async listFiles(projectId) {
    await delay(LATENCY);
    const result = [];
    for (const [name, id] of this.names.entries()) {
      result.push({ id, name });
    }
    return result;
  }

  async updateFile(id, content) {
    await delay(LATENCY);
    this.files.set(id, content);
    return true;
  }

  async createFile(name, content, projectId) {
    await delay(LATENCY);
    const id = `file-${this.nextId++}`;
    this.files.set(id, content);
    this.names.set(name, id);
    return { id, name };
  }

  // --- Implementations ---

  // 1. Sequential (From prompt description)
  async syncProjectSequential(projectId, localFiles) {
    this.syncStatus.syncedFiles = 0;
    const remoteFiles = await this.listFiles(projectId);
    const remoteFileMap = new Map(remoteFiles.map(f => [f.name, f]));

    for (const [path, content] of localFiles) {
      const existingFile = remoteFileMap.get(path);

      if (existingFile) {
        await this.updateFile(existingFile.id, content);
      } else {
        await this.createFile(path, content, projectId);
      }

      this.syncStatus.syncedFiles = (this.syncStatus.syncedFiles || 0) + 1;
      this.notifyListeners();
    }
  }

  // 2. Current Repo (Promise.race pool)
  async syncProjectCurrentRepo(projectId, localFiles) {
    this.syncStatus.syncedFiles = 0;
    const remoteFiles = await this.listFiles(projectId);
    const remoteFileMap = new Map(remoteFiles.map(f => [f.name, f]));

    const CONCURRENCY = 5;
    const executing = new Set();

    for (const [path, content] of localFiles) {
      const task = async () => {
        const existingFile = remoteFileMap.get(path);

        if (existingFile) {
          await this.updateFile(existingFile.id, content);
        } else {
          await this.createFile(path, content, projectId);
        }

        this.syncStatus.syncedFiles = (this.syncStatus.syncedFiles || 0) + 1;
        this.notifyListeners();
      };

      const p = task().finally(() => {
        executing.delete(p);
      });
      executing.add(p);

      if (executing.size >= CONCURRENCY) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
  }

  // 3. Proposed (Promise.all with limit helper)
  async syncProjectProposed(projectId, localFiles) {
    this.syncStatus.syncedFiles = 0;
    const remoteFiles = await this.listFiles(projectId);
    const remoteFileMap = new Map(remoteFiles.map(f => [f.name, f]));

    const CONCURRENCY = 5;

    // Simple p-limit like implementation
    const limit = (concurrency) => {
      const queue = [];
      let active = 0;

      const next = () => {
        active--;
        if (queue.length > 0) {
          queue.shift()();
        }
      };

      const run = async (fn) => {
        const start = async () => {
            active++;
            try {
                return await fn();
            } finally {
                next();
            }
        }

        if (active < concurrency) {
          return start();
        }

        return new Promise(resolve => {
            queue.push(async () => {
                resolve(await start());
            });
        });
      };
      return run;
    };

    const runTask = limit(CONCURRENCY);

    const tasks = Array.from(localFiles).map(([path, content]) => {
      return runTask(async () => {
        const existingFile = remoteFileMap.get(path);
        if (existingFile) {
          await this.updateFile(existingFile.id, content);
        } else {
          await this.createFile(path, content, projectId);
        }
        this.syncStatus.syncedFiles = (this.syncStatus.syncedFiles || 0) + 1;
        this.notifyListeners();
      });
    });

    await Promise.all(tasks);
  }
}

async function runBenchmark() {
  const fileCount = 50;
  const localFiles = new Map();
  for (let i = 0; i < fileCount; i++) {
    localFiles.set(`file-${i}.txt`, `content-${i}`);
  }
  const projectId = 'proj-1';

  console.log(`Running benchmark with ${fileCount} files, ~${LATENCY}ms latency per op.`);

  // Test 1: Sequential
  const service1 = new MockDriveService();
  const start1 = performance.now();
  await service1.syncProjectSequential(projectId, localFiles);
  const end1 = performance.now();
  console.log(`Sequential: ${(end1 - start1).toFixed(2)}ms`);

  // Test 2: Current Repo
  const service2 = new MockDriveService();
  const start2 = performance.now();
  await service2.syncProjectCurrentRepo(projectId, localFiles);
  const end2 = performance.now();
  console.log(`Current Repo: ${(end2 - start2).toFixed(2)}ms`);

  // Test 3: Proposed
  const service3 = new MockDriveService();
  const start3 = performance.now();
  await service3.syncProjectProposed(projectId, localFiles);
  const end3 = performance.now();
  console.log(`Proposed:   ${(end3 - start3).toFixed(2)}ms`);
}

runBenchmark();
