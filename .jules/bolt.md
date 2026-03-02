# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-26 - [Route-based Code Splitting]
**Learning:** Monolithic bundle size was driven by static imports of 15 large views in `App.tsx`. Implementing `React.lazy` with `Suspense` automatically triggered Vite to generate separate chunks for each route, reducing initial load weight significantly.
**Action:** When adding new views, always use `React.lazy` imports and verify chunk generation with `pnpm build`. Ensure fallbacks are scoped appropriately (e.g., content area vs full screen).

## 2026-03-02 - [React Context Provider Values Object Literal Memoization]
**Learning:** React Context providers rendering with object literals as the value prop (e.g. `value={{ state, action }}`) will trigger unnecessary re-renders of all consuming components every time the provider re-renders. This is due to object reference instability.
**Action:** When creating new React Context providers or reviewing existing ones, ensure the provider's `value` prop is wrapped in `useMemo` with an explicit dependency array to maintain reference stability and prevent widespread re-renders.
