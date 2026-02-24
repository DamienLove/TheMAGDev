export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

export const REACT_TEMPLATE: FileNode[] = [
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
    <div className="App">
      <header className="App-header">
        <h1>Hello from TheMAG.dev React Template</h1>
        <p>Edit <code>src/App.tsx</code> and save to reload.</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
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
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      },
      {
        name: 'App.css',
        path: '/src/App.css',
        type: 'file',
        language: 'css',
        content: `.App {
  text-align: center;
  font-family: sans-serif;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

button {
  font-size: 1rem;
  padding: 0.5em 1em;
  margin-top: 1em;
  border-radius: 4px;
  border: none;
  background: #61dafb;
  color: #282c34;
  cursor: pointer;
}`
      },
      {
        name: 'index.css',
        path: '/src/index.css',
        type: 'file',
        language: 'css',
        content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`
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
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^4.9.3",
    "vite": "^4.2.0"
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
  }
];

export const NODE_TEMPLATE: FileNode[] = [
  {
    name: 'index.js',
    path: '/index.js',
    type: 'file',
    language: 'javascript',
    content: `const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from TheMAG.dev Node.js Template!\\n');
});

server.listen(port, hostname, () => {
  console.log(\`Server running at http://\${hostname}:\${port}/\`);
});`
  },
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "node-starter",
  "version": "1.0.0",
  "description": "Simple Node.js starter",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}`
  },
  {
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    language: 'markdown',
    content: `# Node.js Starter

A simple Node.js HTTP server.

## Usage

\`\`\`bash
npm start
\`\`\`
`
  }
];

export const STATIC_TEMPLATE: FileNode[] = [
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
    <title>Static Template</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Hello from Static Template!</h1>
        <p>This is a simple HTML/CSS/JS project.</p>
        <button id="clickBtn">Click Me</button>
        <p id="output"></p>
    </div>
    <script src="script.js"></script>
</body>
</html>`
  },
  {
    name: 'style.css',
    path: '/style.css',
    type: 'file',
    language: 'css',
    content: `body {
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
    margin: 0;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: center;
}

button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background-color: #0056b3;
}`
  },
  {
    name: 'script.js',
    path: '/script.js',
    type: 'file',
    language: 'javascript',
    content: `document.getElementById('clickBtn').addEventListener('click', () => {
    const output = document.getElementById('output');
    output.textContent = 'Button clicked at ' + new Date().toLocaleTimeString();
});`
  }
];
