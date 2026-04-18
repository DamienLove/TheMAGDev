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

## 2026-04-18 - [Referential Equality in Sets and Arrays for React State]
**Learning:** Using functional state updaters for `Set` objects (e.g., `setUnsavedFiles(prev => { const next = new Set(prev); next.delete(path); return next; })`) forces a new object reference to be created even when the state fundamentally does not change (e.g., the path was not in the set to begin with). This bypasses React's referential equality check, triggering unnecessary full tree re-renders for consumers of the context. Similarly, repeated $O(N)$ `.find()` array methods inside the main render function can become a bottleneck when rendering complex layouts with high iteration counts.
**Action:** Always implement early returns for Set and Map state updates (`prev.has(path) ? prev : new Set(prev).add(path)` or `!prev.has(path) ? prev : ...`) to preserve referential equality when the data does not change. Replace repeated $O(N)$ lookups in React component render cycles with $O(1)$ memoized lookup dictionaries created via `useMemo`.
