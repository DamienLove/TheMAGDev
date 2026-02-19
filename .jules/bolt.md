# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-19 - [Lazy Loading Optimization]
**Learning:** `App.tsx` statically imported all top-level views, including heavy components like `CodeEditor` and `DesktopWorkspace` which utilize `MonacoEditor`. This caused the initial bundle to be unnecessarily large (~1.5MB uncompressed).
**Action:** Replaced static imports with `React.lazy` and `Suspense` for all major views. Changed `WorkspaceProvider` import to bypass the barrel file (`src/components/workspace/index.ts`) which was inadvertently pulling in `MonacoEditor` code. This reduced the main bundle size by ~50% (to ~750kB).
