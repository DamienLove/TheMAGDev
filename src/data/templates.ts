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
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
  },
  {
    name: 'index.js',
    path: '/index.js',
    type: 'file',
    language: 'javascript',
    content: `import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello form Express!');
});

app.listen(port, () => {
  console.log(\`Example app listening on port \${port}\`);
});`
  }
];

export const PYTHON_TEMPLATE: FileNode[] = [
  {
    name: 'main.py',
    path: '/main.py',
    type: 'file',
    language: 'python',
    content: `def main():
    print("Hello from Python!")

    # Calculate some primes
    primes = find_primes(50)
    print(f"Primes up to 50: {primes}")

def find_primes(limit):
    primes = []
    for num in range(2, limit + 1):
        is_prime = True
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    return primes

if __name__ == "__main__":
    main()
`
  },
  {
    name: 'requirements.txt',
    path: '/requirements.txt',
    type: 'file',
    language: 'plaintext',
    content: `# Add your python dependencies here
requests==2.31.0
`
  },
  {
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    language: 'markdown',
    content: `# Python Starter
A simple Python starter template.

## Running
\`\`\`bash
python main.py
\`\`\`
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
    println!("Hello from Rust!");

    let primes = find_primes(50);
    println!("Primes up to 50: {:?}", primes);
}

fn find_primes(limit: u32) -> Vec<u32> {
    let mut primes = Vec::new();
    for num in 2..=limit {
        let mut is_prime = true;
        let limit_sqrt = (num as f64).sqrt() as u32;
        for i in 2..=limit_sqrt {
            if num % i == 0 {
                is_prime = false;
                break;
            }
        }
        if is_prime {
            primes.append(&mut vec![num]);
        }
    }
    primes
}
`
      }
    ]
  },
  {
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    language: 'markdown',
    content: `# Rust Starter
A simple Rust starter template.

## Running
\`\`\`bash
cargo run
\`\`\`
`
  }
];

export const VUE_TEMPLATE: FileNode[] = [
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "vue-starter",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.4",
    "vite": "^5.2.0"
  }
}`
  },
  {
    name: 'vite.config.js',
    path: '/vite.config.js',
    type: 'file',
    language: 'javascript',
    content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`
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
    <title>Vite + Vue</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`
  },
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'main.js',
        path: '/src/main.js',
        type: 'file',
        language: 'javascript',
        content: `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')`
      },
      {
        name: 'style.css',
        path: '/src/style.css',
        type: 'file',
        language: 'css',
        content: `body {
  margin: 0;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #242424;
  color: #fff;
}`
      },
      {
        name: 'App.vue',
        path: '/src/App.vue',
        type: 'file',
        language: 'html',
        content: `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="card">
    <h1>Hello Vue!</h1>
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>
</template>

<style scoped>
.card {
  padding: 2em;
  text-align: center;
}
button {
  background-color: #1a1a1a;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #fff;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
</style>`
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
