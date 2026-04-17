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

## 2026-03-10 - [Set State Referential Equality Trap in React Contexts]
**Learning:** When using `Set` or `Map` data structures in React state (especially when exposed via Context like `unsavedFiles` in WorkspaceContext), creating a new instance (`new Set(prev)`) without checking if the data actually changed forces downstream components to re-render. Since Context updates affect all subscribers, making redundant updates (e.g. saving an already-saved file) causes unnecessary massive re-renders across the app.
**Action:** Always implement early returns (`prev.has(path) ? prev : ...` or `prev.size === 0 ? prev : ...`) in state setter callbacks for `Set` and `Map` to preserve referential equality when the semantic state hasn't changed.
