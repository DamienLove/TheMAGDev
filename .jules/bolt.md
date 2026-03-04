# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-26 - [Route-based Code Splitting]
**Learning:** Monolithic bundle size was driven by static imports of 15 large views in `App.tsx`. Implementing `React.lazy` with `Suspense` automatically triggered Vite to generate separate chunks for each route, reducing initial load weight significantly.
**Action:** When adding new views, always use `React.lazy` imports and verify chunk generation with `pnpm build`. Ensure fallbacks are scoped appropriately (e.g., content area vs full screen).

## 2025-03-04 - [Context Provider Memoization]
**Learning:** Using inline object literals as `value` props for app-wide React Context providers (like `WorkspaceContext` and `SettingsContext`) causes unnecessary re-renders in all consuming components on every state update, leading to significant performance bottlenecks in this codebase's architecture.
**Action:** Always wrap Context provider `value` objects in `useMemo` with correctly configured dependency arrays to maintain referential stability.
