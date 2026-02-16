# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2024-05-24 - [File Tree Optimization]
**Learning:** The inline `renderFileTree` function in `DesktopWorkspace.tsx` was causing unnecessary re-renders of the entire file tree on every workspace update. Replacing it with the memoized `FileExplorer` component improved rendering efficiency and reduced code duplication.
**Action:** Always look for inline recursive rendering functions that can be replaced by existing memoized components.
