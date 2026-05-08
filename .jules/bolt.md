# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-26 - [Route-based Code Splitting]
**Learning:** Monolithic bundle size was driven by static imports of 15 large views in `App.tsx`. Implementing `React.lazy` with `Suspense` automatically triggered Vite to generate separate chunks for each route, reducing initial load weight significantly.
**Action:** When adding new views, always use `React.lazy` imports and verify chunk generation with `pnpm build`. Ensure fallbacks are scoped appropriately (e.g., content area vs full screen).

## 2026-03-01 - [React Context Object Re-render Trap & Memoization]
**Learning:** Using an unmemoized object literal as a Context `value` forces *every* consuming component to re-render on every Provider render, bypassing React's bailout mechanisms. This creates massive performance bottlenecks in large component trees (like WorkspaceContext and SettingsContext) because a new object reference is created even if the underlying data hasn't changed.
**Action:** Always wrap Context Provider `value` objects in `useMemo` with a complete and correctly configured dependency array to ensure referential equality and prevent unnecessary downstream re-renders.

## 2025-03-09 - [Path Pruning for Recursive React Context Updates]
**Learning:** In highly nested data structures like `FileNode[]` stored in React state, recursive operations such as mapping (`updateFileContent`, `renameFile`), filtering (`deleteFile`), or adding (`createFile`) can inadvertently trigger full O(N) tree traversals across thousands of nodes. This causes significant UI blocking in features like file explorers when typing or making frequent changes.
**Action:** Always implement path prefix pruning in recursive state updates (e.g., `if (targetPath.startsWith(node.path + '/'))`). This bypasses unnecessary branches, successfully optimizing the state update logic from O(N) to O(log N).

## 2024-05-23 - [Parallelize Git Blob SHA Computation and File Fetching]
**Learning:** Computing SHAs sequentially (`await computeGitBlobSha`) inside a loop for many files or sequentially fetching files from GitHub blocks the main thread and introduces significant delays. Using `crypto.subtle.digest` or network requests can be parallelized effectively since they return promises.
**Action:** Always use `Promise.all` when iterating over collections where each item requires an asynchronous operation, like generating hashes or performing network calls, to allow concurrent execution and improve performance.
