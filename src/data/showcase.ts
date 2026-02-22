import { FileNode } from '../components/workspace/WorkspaceContext';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  author: string;
  authorAvatar: string;
  stars: string;
  thumbnail: string;
  platforms: string[];
  status: 'New' | 'Popular' | 'Updated' | 'Verified';
  files: FileNode[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'p-1',
    name: 'React Starter',
    description: 'A modern React + TypeScript + Vite + Tailwind CSS starter template.',
    author: '@themag_dev',
    authorAvatar: 'TM',
    stars: '1.2k',
    thumbnail: './assets/store/hero_illustration.svg',
    platforms: ['android', 'phone_iphone'],
    status: 'Verified',
    files: [
      {
        name: 'src',
        path: '/src',
        type: 'folder',
        children: [
          {
            name: 'App.tsx',
            path: '/src/App.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React, { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white font-sans p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          React Starter
        </h1>
        <p className="text-zinc-400">Vite + React + Tailwind CSS</p>
      </header>

      <div className="bg-zinc-800 p-8 rounded-2xl shadow-xl border border-zinc-700 w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-6xl font-mono font-bold mb-4">{count}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setCount((c) => c - 1)}
              className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold transition-colors"
            >
              Decrease
            </button>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20"
            >
              Increase
            </button>
          </div>
        </div>
        <p className="text-sm text-zinc-500 text-center">
          Edit <code>src/App.tsx</code> to see changes instantly.
        </p>
      </div>
    </div>
  );
}

export default App;`
          },
          {
            name: 'App.css',
            path: '/src/App.css',
            type: 'file',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
          },
          {
            name: 'main.tsx',
            path: '/src/main.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`
          },
          {
            name: 'index.css',
            path: '/src/index.css',
            type: 'file',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #18181b;
  color: #fff;
}`
          },
          {
            name: 'vite-env.d.ts',
            path: '/src/vite-env.d.ts',
            type: 'file',
            language: 'typescript',
            content: `/// <reference types="vite/client" />`
          }
        ]
      },
      {
        name: 'public',
        path: '/public',
        type: 'folder',
        children: [
          {
            name: 'vite.svg',
            path: '/public/vite.svg',
            type: 'file',
            language: 'svg',
            content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><path fill="#bd34fe" d="M2 2h28v28H2z"/></svg>`
          }
        ]
      },
      {
        name: 'index.html',
        path: '/index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      },
      {
        name: 'package.json',
        path: '/package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "vite-react-ts-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`
      },
      {
        name: 'tsconfig.json',
        path: '/tsconfig.json',
        type: 'file',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
      },
      {
        name: 'tsconfig.node.json',
        path: '/tsconfig.node.json',
        type: 'file',
        language: 'json',
        content: `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`
      },
      {
        name: 'vite.config.ts',
        path: '/vite.config.ts',
        type: 'file',
        language: 'typescript',
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`
      },
      {
        name: 'postcss.config.js',
        path: '/postcss.config.js',
        type: 'file',
        language: 'javascript',
        content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
      },
      {
        name: 'tailwind.config.js',
        path: '/tailwind.config.js',
        type: 'file',
        language: 'javascript',
        content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      }
    ]
  },
  {
    id: 'p-2',
    name: 'Node API Server',
    description: 'Minimal Express server with TypeScript and nodemon.',
    author: '@backend_pro',
    authorAvatar: 'BP',
    stars: '854',
    thumbnail: './assets/store/tech_pattern.svg',
    platforms: ['language'],
    status: 'Popular',
    files: [
      {
        name: 'src',
        path: '/src',
        type: 'folder',
        children: [
          {
            name: 'index.ts',
            path: '/src/index.ts',
            type: 'file',
            language: 'typescript',
            content: `import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node API Server!' });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(\`Server is running at http://localhost:\${port}\`);
});`
          }
        ]
      },
      {
        name: 'package.json',
        path: '/package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "node-api-server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.12.7",
    "nodemon": "^3.1.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}`
      },
      {
        name: 'tsconfig.json',
        path: '/tsconfig.json',
        type: 'file',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}`
      }
    ]
  },
  {
    id: 'p-3',
    name: 'Static Portfolio',
    description: 'Clean HTML5/CSS3 portfolio template with responsive grid.',
    author: '@design_guru',
    authorAvatar: 'DG',
    stars: '2.4k',
    thumbnail: './assets/store/dark_hex_pattern.svg',
    platforms: ['desktop_mac', 'palette'],
    status: 'New',
    files: [
      {
        name: 'index.html',
        path: '/index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>Alex Developer</h1>
            <p>Full Stack Engineer & UI Designer</p>
        </div>
    </header>

    <main class="container">
        <section class="grid">
            <div class="card">
                <h2>Project Alpha</h2>
                <p>A revolutionary new app built with React Native.</p>
                <a href="#">View Case Study &rarr;</a>
            </div>
            <div class="card">
                <h2>Project Beta</h2>
                <p>E-commerce platform scalable to millions.</p>
                <a href="#">View Case Study &rarr;</a>
            </div>
            <div class="card">
                <h2>Project Gamma</h2>
                <p>AI-powered analytics dashboard.</p>
                <a href="#">View Case Study &rarr;</a>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2024 Alex Developer. Built with TheMAG.dev.</p>
        </div>
    </footer>
</body>
</html>`
      },
      {
        name: 'style.css',
        path: '/style.css',
        type: 'file',
        language: 'css',
        content: `* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #0f172a;
    color: #e2e8f0;
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

header {
    background: linear-gradient(135deg, #4f46e5, #9333ea);
    padding: 4rem 0;
    text-align: center;
    margin-bottom: 4rem;
}

h1 {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

h2 {
    color: #818cf8;
    margin-bottom: 1rem;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.card {
    background-color: #1e293b;
    border: 1px solid #334155;
    border-radius: 0.5rem;
    padding: 2rem;
    transition: transform 0.2s;
}

.card:hover {
    transform: translateY(-5px);
    border-color: #4f46e5;
}

a {
    display: inline-block;
    margin-top: 1rem;
    color: #4f46e5;
    text-decoration: none;
    font-weight: bold;
}

a:hover {
    text-decoration: underline;
}

footer {
    text-align: center;
    margin-top: 4rem;
    padding: 2rem 0;
    border-top: 1px solid #334155;
    color: #64748b;
}`
      }
    ]
  }
];
