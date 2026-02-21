# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-21 - [App.tsx Code Splitting]
**Learning:** `App.tsx` imported all view components statically, resulting in a large main bundle (~1.1MB compressed). Replacing these with `React.lazy` successfully split the code into smaller chunks (10-40KB each), significantly reducing the initial load payload.
**Action:** When auditing React apps, check the main router/layout file first for static imports of large route components.
