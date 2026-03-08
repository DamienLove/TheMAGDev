import { FileNode } from '../components/workspace/WorkspaceContext';

export const REACT_TEMPLATE: FileNode[] = [
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "vite-react-starter",
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
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}`
  },
  {
    name: 'index.html',
    path: '/index.html',
    type: 'file',
    language: 'html',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
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

// https://vitejs.dev/config/
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
        name: 'main.tsx',
        path: '/src/main.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
      },
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
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App`
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

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
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
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}`
      },
      {
        name: 'App.css',
        path: '/src/App.css',
        type: 'file',
        language: 'css',
        content: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
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
  "name": "express-api-starter",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "echo \\"Running tests...\\" && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  }
}`
  },
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'index.js',
        path: '/src/index.js',
        type: 'file',
        language: 'javascript',
        content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router as apiRouter } from './routes/api.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API', status: 'active' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(\`API server running on port \${port}\`);
});`
      },
      {
        name: 'routes',
        path: '/src/routes',
        type: 'folder',
        children: [
          {
            name: 'api.js',
            path: '/src/routes/api.js',
            type: 'file',
            language: 'javascript',
            content: `import { Router } from 'express';

export const router = Router();

// Mock database
const items = [
  { id: 1, name: 'Item One' },
  { id: 2, name: 'Item Two' }
];

router.get('/items', (req, res) => {
  res.json(items);
});

router.post('/items', (req, res) => {
  const newItem = {
    id: items.length + 1,
    ...req.body
  };
  items.push(newItem);
  res.status(201).json(newItem);
});`
          }
        ]
      }
    ]
  }
];

export const PYTHON_TEMPLATE: FileNode[] = [
  {
    name: 'main.py',
    path: '/main.py',
    type: 'file',
    language: 'python',
    content: `def greet(name: str) -> str:
    """Returns a greeting message."""
    return f"Hello, {name}!"

def main():
    print("Welcome to the Python Starter Template!")

    # Calculate first 10 Fibonacci numbers
    fib = [0, 1]
    for _ in range(8):
        fib.append(fib[-1] + fib[-2])

    print(f"First 10 Fibonacci numbers: {fib}")

if __name__ == "__main__":
    main()
`
  },
  {
    name: 'requirements.txt',
    path: '/requirements.txt',
    type: 'file',
    language: 'plaintext',
    content: `# Add your Python dependencies here
# e.g., requests==2.31.0
`
  }
];

export const RUST_TEMPLATE: FileNode[] = [
  {
    name: 'Cargo.toml',
    path: '/Cargo.toml',
    type: 'file',
    language: 'toml',
    content: `[package]
name = "rust-starter"
version = "0.1.0"
edition = "2021"

[dependencies]
`
  },
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'main.rs',
        path: '/src/main.rs',
        type: 'file',
        language: 'rust',
        content: `fn main() {
    println!("Hello, from Rust!");

    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();

    println!("Sum of 1 to 5 is: {}", sum);
}
`
      }
    ]
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
    <title>Static Site</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <button id="clickMe">Click Me</button>
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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    margin: 0;
    background-color: #f0f0f0;
}

h1 {
    color: #333;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
}`
  },
  {
    name: 'script.js',
    path: '/script.js',
    type: 'file',
    language: 'javascript',
    content: `document.getElementById('clickMe').addEventListener('click', () => {
    alert('Button Clicked!');
});`
  }
];
