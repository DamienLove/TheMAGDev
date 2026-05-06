## 2024-03-09 - Initialization
## 2024-05-06 - Accessible Icon Buttons in CodeEditor
**Learning:** Workspace layout components like CodeEditor contain multiple icon-only utility buttons (e.g., account, settings, terminal actions) that lack screen reader context and visual hover discoverability.
**Action:** Always add explicit `aria-label` and `title` attributes to icon-only buttons introduced or modified in the workspace layout.
