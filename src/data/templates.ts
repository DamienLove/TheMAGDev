import { FileNode } from '../components/workspace/WorkspaceContext';

export const REACT_TEMPLATE: FileNode[] = [
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
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
    "vite": "^5.2.0"
  }
}`
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
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
  },
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'main.jsx',
        path: '/src/main.jsx',
        type: 'file',
        language: 'javascript',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
      },
      {
        name: 'App.jsx',
        path: '/src/App.jsx',
        type: 'file',
        language: 'javascript',
        content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>TheMAG.dev React Starter</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
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
        content: `.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.card {
  padding: 2em;
}`
      },
      {
        name: 'index.css',
        path: '/src/index.css',
        type: 'file',
        language: 'css',
        content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}`
      }
    ]
  }
];

export const NODE_TEMPLATE: FileNode[] = [
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "node-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}`
  },
  {
    name: 'index.js',
    path: '/index.js',
    type: 'file',
    language: 'javascript',
    content: `import http from 'http';

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from TheMAG.dev Node Server!\\n');
});

server.listen(port, hostname, () => {
  console.log(\`Server running at http://\${hostname}:\${port}/\`);
});`
  },
  {
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    language: 'markdown',
    content: `# Node.js Starter

This is a simple Node.js HTTP server.

## Run

\`\`\`bash
npm start
\`\`\`
`
  }
];

export const GAME_TEMPLATE: FileNode[] = [
  {
    name: 'index.html',
    path: '/index.html',
    type: 'file',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Canvas Game</title>
    <style>
        body { margin: 0; overflow: hidden; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
        canvas { border: 2px solid #333; }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script src="game.js"></script>
</body>
</html>`
  },
  {
    name: 'game.js',
    path: '/game.js',
    type: 'file',
    language: 'javascript',
    content: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = 2;
let dy = -2;
const ballRadius = 10;

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();

    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

draw();`
  }
];

export const TEMPLATES: Record<string, FileNode[]> = {
  'p-1': NODE_TEMPLATE, // FinTrack -> Node
  'p-2': REACT_TEMPLATE, // DevFlow -> React
  'p-3': GAME_TEMPLATE, // Cyber Jumper -> Game
  'p-4': REACT_TEMPLATE, // CryptoDash -> React
  'p-5': REACT_TEMPLATE, // Nexus UI -> React
  'p-6': NODE_TEMPLATE, // CloudScale -> Node
  'p-7': GAME_TEMPLATE, // Pixel Quest -> Game
  'p-8': REACT_TEMPLATE, // DataViz -> React
  'p-9': NODE_TEMPLATE, // Social Connect -> Node
};
