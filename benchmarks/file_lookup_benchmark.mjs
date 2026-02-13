
// Mock FileNode interface
const FileNode = {
  name: '',
  path: '',
  type: 'file', // 'file' | 'folder'
  children: [],
};

// Original recursive implementation
function findFileByPathRecursive(nodes, path) {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFileByPathRecursive(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

// Optimized implementation: Flatten to Map
function buildFileMap(nodes) {
  const map = new Map();
  const traverse = (list) => {
    for (const node of list) {
      map.set(node.path, node);
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(nodes);
  return map;
}

// Generate a large file tree
function generateFileTree(depth, width, currentPath = '') {
  const nodes = [];
  for (let i = 0; i < width; i++) {
    const isFolder = depth > 0 && Math.random() > 0.3;
    const name = isFolder ? `dir_${depth}_${i}` : `file_${depth}_${i}`;
    const path = currentPath ? `${currentPath}/${name}` : `/${name}`;

    const node = {
      name,
      path,
      type: isFolder ? 'folder' : 'file',
      children: isFolder ? generateFileTree(depth - 1, width, path) : undefined
    };
    nodes.push(node);
  }
  return nodes;
}

// Collect all paths to query later
function collectPaths(nodes, paths = []) {
  for (const node of nodes) {
    paths.push(node.path);
    if (node.children) {
      collectPaths(node.children, paths);
    }
  }
  return paths;
}

console.log('Generating file tree...');
const tree = generateFileTree(4, 8); // Depth 4, width 8 at each level -> ~8^4 nodes = 4096 (actually more due to branching factor logic)
const allPaths = collectPaths(tree);
console.log(`Generated ${allPaths.length} files/folders.`);

// Benchmark Recursive
console.log('\nBenchmarking Recursive Lookup...');
const startRecursive = performance.now();
for (let i = 0; i < 10000; i++) {
  const path = allPaths[Math.floor(Math.random() * allPaths.length)];
  findFileByPathRecursive(tree, path);
}
const endRecursive = performance.now();
const timeRecursive = endRecursive - startRecursive;
console.log(`Recursive: ${timeRecursive.toFixed(2)}ms for 10000 lookups.`);

// Benchmark Map
console.log('\nBenchmarking Map Lookup...');
const startMapBuild = performance.now();
const fileMap = buildFileMap(tree);
const endMapBuild = performance.now();
console.log(`Map Build Time: ${(endMapBuild - startMapBuild).toFixed(2)}ms`);

const startMap = performance.now();
for (let i = 0; i < 10000; i++) {
  const path = allPaths[Math.floor(Math.random() * allPaths.length)];
  fileMap.get(path);
}
const endMap = performance.now();
const timeMap = endMap - startMap;
console.log(`Map Lookup: ${timeMap.toFixed(2)}ms for 10000 lookups.`);

console.log(`\nImprovement: ${(timeRecursive / timeMap).toFixed(2)}x faster lookup (excluding build time).`);
