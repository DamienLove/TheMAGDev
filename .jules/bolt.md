# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-26 - [Route-based Code Splitting]
**Learning:** Monolithic bundle size was driven by static imports of 15 large views in `App.tsx`. Implementing `React.lazy` with `Suspense` automatically triggered Vite to generate separate chunks for each route, reducing initial load weight significantly.
**Action:** When adding new views, always use `React.lazy` imports and verify chunk generation with `pnpm build`. Ensure fallbacks are scoped appropriately (e.g., content area vs full screen).

## 2026-05-31 - [Memoize Context Values]
**Learning:** React Context provider values defined as inline object literals cause unnecessary re-renders of all consuming components on every state change because a new object reference is created.
**Action:** Always wrap Context provider `value` objects in `useMemo` with correctly configured dependency arrays instead of using inline object literals.
