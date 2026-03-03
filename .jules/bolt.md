# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-26 - [Route-based Code Splitting]
**Learning:** Monolithic bundle size was driven by static imports of 15 large views in `App.tsx`. Implementing `React.lazy` with `Suspense` automatically triggered Vite to generate separate chunks for each route, reducing initial load weight significantly.
**Action:** When adding new views, always use `React.lazy` imports and verify chunk generation with `pnpm build`. Ensure fallbacks are scoped appropriately (e.g., content area vs full screen).

## 2026-03-03 - [Context Memoization]
**Learning:** Passing inline object literals as context provider values causes widespread, unnecessary re-renders of all consuming components whenever the provider re-renders, even if the actual state values haven't changed. This is a significant performance bottleneck in large applications like this one.
**Action:** Always wrap React Context provider values in `useMemo` with correctly configured dependency arrays, rather than using inline object literals. This prevents unnecessary re-renders across the application.
