## 2024-03-09 - Initialization
## 2026-04-15 - Adding aria-labels to Workspace icon-only controls
**Learning:** All icon-only buttons in the workspace layout (such as activity bar components and bottom panel controls in `views/CodeEditor.tsx`) must utilize explicit `aria-label` and `title` attributes to ensure screen reader accessibility compliance and hover discoverability.
**Action:** Always verify that state-changing and navigational icon controls use both `aria-label` and `title` when reviewing new Workspace components.
