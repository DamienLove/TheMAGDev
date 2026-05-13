## 2024-03-09 - Initialization
## 2026-05-13 - ARIA labels in workspace layout
**Learning:** The workspace layout components (views/CodeEditor.tsx, views/DesktopWorkspace.tsx) used icon-only buttons for various actions (refresh, sidebar toggles, settings, account) without ARIA labels, making them inaccessible to screen readers. This is a common pattern when quickly building toolbars.
**Action:** Always add explicit `aria-label` and `title` attributes to icon-only buttons in workspace layouts.
