import type { FileNode } from '../components/workspace';

export const templates: Record<string, FileNode[]> = {
  'react-starter': [
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      language: 'json',
      content: JSON.stringify({
        name: "react-starter",
        version: "1.0.0",
        type: "module",
        scripts: {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0"
        },
        devDependencies: {
          "@types/react": "^18.2.43",
          "@types/react-dom": "^18.2.17",
          "@vitejs/plugin-react": "^4.2.1",
          "typescript": "^5.2.2",
          "vite": "^5.0.8"
        }
      }, null, 2)
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
    },
    {
      name: 'vite.config.ts',
      path: '/vite.config.ts',
      type: 'file',
      language: 'typescript',
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
    },
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
          content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="card">
      <h1>Vite + React</h1>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default App`
        },
        {
          name: 'App.css',
          path: '/src/App.css',
          type: 'file',
          language: 'css',
          content: `.card {
  padding: 2em;
  text-align: center;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}`
        },
        {
          name: 'main.tsx',
          path: '/src/main.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
        }
      ]
    }
  ],
  'node-api': [
    {
      name: 'package.json',
      path: '/package.json',
      type: 'file',
      language: 'json',
      content: JSON.stringify({
        name: "node-api",
        version: "1.0.0",
        type: "module",
        scripts: {
          "start": "node server.js",
          "dev": "node --watch server.js"
        },
        dependencies: {
          "express": "^4.18.2"
        }
      }, null, 2)
    },
    {
      name: 'server.js',
      path: '/server.js',
      type: 'file',
      language: 'javascript',
      content: `import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node API!' });
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`
    }
  ],
  'static-web': [
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
    <title>Static Site</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to My Static Site</h1>
        <p>This is a simple static website hosted on TheMAG.dev.</p>
        <button id="clickBtn">Click Me</button>
        <p id="output"></p>
    </div>
    <script src="script.js"></script>
</body>
</html>`
    },
    {
      name: 'styles.css',
      path: '/styles.css',
      type: 'file',
      language: 'css',
      content: `body {
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
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
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}
button:hover {
    background: #0056b3;
}`
    },
    {
      name: 'script.js',
      path: '/script.js',
      type: 'file',
      language: 'javascript',
      content: `document.getElementById('clickBtn').addEventListener('click', () => {
    document.getElementById('output').textContent = 'Button clicked at ' + new Date().toLocaleTimeString();
});`
    }
  ],
  'python-script': [
    {
      name: 'main.py',
      path: '/main.py',
      type: 'file',
      language: 'python',
      content: `import sys

def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

def main():
    print("Python version:", sys.version)
    n = 10
    print(f"Fibonacci({n}) = {fibonacci(n)}")

if __name__ == "__main__":
    main()`
    },
    {
      name: 'requirements.txt',
      path: '/requirements.txt',
      type: 'file',
      language: 'plaintext',
      content: `# No dependencies yet`
    }
  ]
};
