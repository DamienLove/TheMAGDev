export interface GitHubUser {
  login: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface GitHubRepo {
  owner: string;
  name: string;
  defaultBranch: string;
}

export interface GitHubBranch {
  name: string;
  commitSha: string;
}

export interface GitHubTreeItem {
  path: string;
  sha: string;
  type: 'blob' | 'tree';
}

const STORAGE_KEY = 'themag_github_auth';
const REPO_KEY = 'themag_github_repo';
const GITHUB_API = 'https://api.github.com';

class GitHubService {
  private token: string | null = null;
  private repo: GitHubRepo | null = null;

  constructor() {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      this.token = savedToken;
    }
    const savedRepo = localStorage.getItem(REPO_KEY);
    if (savedRepo) {
      try {
        this.repo = JSON.parse(savedRepo) as GitHubRepo;
      } catch {
        this.repo = null;
      }
    }
  }

  isConnected(): boolean {
    return Boolean(this.token);
  }

  getRepo(): GitHubRepo | null {
    return this.repo;
  }

  getToken(): string | null {
    return this.token;
  }

  disconnect() {
    this.token = null;
    this.repo = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REPO_KEY);
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      throw new Error('GitHub token not configured.');
    }

    const response = await fetch(`${GITHUB_API}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${this.token}`,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'GitHub request failed.');
    }
    return response.json() as Promise<T>;
  }

  async connect(token: string): Promise<GitHubUser> {
    this.token = token;
    localStorage.setItem(STORAGE_KEY, token);
    return this.getAuthenticatedUser();
  }

  async getAuthenticatedUser(): Promise<GitHubUser> {
    const data = await this.request<{ login: string; name?: string | null; avatar_url?: string }>(
      '/user'
    );
    return {
      login: data.login,
      name: data.name ?? null,
      avatarUrl: data.avatar_url ?? null,
    };
  }

  async setRepo(owner: string, name: string): Promise<GitHubRepo> {
    const data = await this.request<{ default_branch?: string }>(`/repos/${owner}/${name}`);
    const repo: GitHubRepo = {
      owner,
      name,
      defaultBranch: data.default_branch || 'main',
    };
    this.repo = repo;
    localStorage.setItem(REPO_KEY, JSON.stringify(repo));
    return repo;
  }

  async listBranches(owner: string, name: string): Promise<GitHubBranch[]> {
    const data = await this.request<Array<{ name: string; commit: { sha: string } }>>(
      `/repos/${owner}/${name}/branches`
    );
    return data.map((branch) => ({
      name: branch.name,
      commitSha: branch.commit.sha,
    }));
  }

  async getTree(owner: string, name: string, branch: string): Promise<GitHubTreeItem[]> {
    const treeish = encodeURIComponent(branch);
    const data = await this.request<{ tree: Array<{ path: string; sha: string; type: 'blob' | 'tree' }> }>(
      `/repos/${owner}/${name}/git/trees/${treeish}?recursive=1`
    );
    return (data.tree || []).filter((item) => item.type === 'blob') as GitHubTreeItem[];
  }

  async getFileContent(owner: string, name: string, path: string, branch: string): Promise<string> {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const data = await this.request<{ content: string; encoding: string }>(
      `/repos/${owner}/${name}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`
    );
    if (data.encoding === 'base64') {
      return atob(data.content.replace(/\n/g, ''));
    }
    return data.content;
  }

  private toBase64(content: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  async updateFile(
    owner: string,
    name: string,
    path: string,
    content: string,
    message: string,
    branch: string,
    sha?: string
  ) {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const body = {
      message,
      content: this.toBase64(content),
      branch,
      sha,
    };
    await this.request(`/repos/${owner}/${name}/contents/${encodedPath}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteFile(
    owner: string,
    name: string,
    path: string,
    message: string,
    branch: string,
    sha: string
  ) {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const body = {
      message,
      branch,
      sha,
    };
    await this.request(`/repos/${owner}/${name}/contents/${encodedPath}`, {
      method: 'DELETE',
      body: JSON.stringify(body),
    });
  }
}

export const githubService = new GitHubService();
export default githubService;
