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

## 2024-05-14 - [Path Pruning for Workspace File Lookups]
**Learning:** Rebuilding a deeply nested lookup map on every React state change via `useMemo` causes massive O(N) allocation overhead. Replacing the eager `useMemo` Map with a lazy O(log N) tree traversal that prunes branches (`targetPath.startsWith(prefix)`) inside a `useCallback` significantly improves performance during frequent updates like typing.
**Action:** When searching deep, frequently updated hierarchical React state (like a file tree), prefer lazy, pruned tree traversal on-demand instead of eagerly maintaining an $O(N)$ lookup map that gets invalidated on every parent state change.
