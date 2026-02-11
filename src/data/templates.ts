import { FileNode } from '../components/workspace/WorkspaceContext';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  files: FileNode[];
  tags: string[];
}

export const REACT_TEMPLATE: ProjectTemplate = {
  id: 'react-vite-ts',
  name: 'React + TypeScript',
  description: 'A modern React application with TypeScript, Vite, and Tailwind CSS.',
  icon: 'react',
  tags: ['react', 'typescript', 'vite', 'tailwind'],
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
import './index.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold text-indigo-400">TheMAG.dev</h1>
        <p className="text-xl text-gray-400">React + TypeScript + Vite Template</p>

        <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl mt-8">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Edit <code>src/App.tsx</code> to test HMR
          </p>
        </div>
      </header>
    </div>
  );
}

export default App;`
        },
        {
          name: 'main.tsx',
          path: '/src/main.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
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
    <title>TheMAG.dev React App</title>
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
  "name": "react-ts-template",
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
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
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
    }
  ]
};

export const NODE_TEMPLATE: ProjectTemplate = {
  id: 'node-express',
  name: 'Node.js API',
  description: 'A minimal Express.js server setup.',
  icon: 'nodejs',
  tags: ['node', 'express', 'javascript', 'api'],
  files: [
    {
      name: 'index.js',
      path: '/index.js',
      type: 'file',
      language: 'javascript',
      content: `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from TheMAG.dev!',
    timestamp: new Date().toISOString(),
    environment: 'WebContainer'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`
    },
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      language: 'json',
      content: `{
  "name": "node-express-template",
  "version": "1.0.0",
  "description": "Express API Template",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`
    },
    {
      name: 'README.md',
      path: '/README.md',
      type: 'file',
      language: 'markdown',
      content: `# Node.js Express Template

A simple Express server running in TheMAG.dev WebContainer.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

3. Or run in development mode:
   \`\`\`bash
   npm run dev
   \`\`\`
`
    }
  ]
};

export const TEMPLATES: ProjectTemplate[] = [
  REACT_TEMPLATE,
  NODE_TEMPLATE
];
