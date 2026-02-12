# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2024-05-22 - [Code Splitting with React.lazy]
**Learning:** The application had all views (including heavy ones like `CodeEditor` with Monaco and `DesktopWorkspace` with Xterm) imported eagerly in `App.tsx`. This resulted in a massive initial bundle (1.47 MB).
**Action:** Implemented `React.lazy` and `Suspense` for all top-level views. Also optimized `WorkspaceProvider` import to avoid barrel file side-effects.
**Result:** Initial bundle size reduced by ~50% (to ~750 kB). Critical learning: Barrel files (`index.ts`) can inadvertently pull in heavy dependencies if not tree-shaken correctly or if imported by a parent component that is eagerly loaded. Direct imports are safer for performance.
