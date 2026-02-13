# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-13 - [Barrel File Impact on Code Splitting]
**Learning:** Importing from a barrel file (e.g., `src/components/workspace/index.ts`) can inadvertently bundle heavy components (like `MonacoEditor`) into the main chunk, negating the benefits of code splitting for other views.
**Action:** Always import context providers or shared utilities directly from their source files when implementing code splitting to ensure clean chunk separation.
