## 2024-03-09 - Initialization
## 2026-04-14 - Added aria-labels to icon-only buttons in CodeEditor
**Learning:** In the workspace layout (specifically CodeEditor), icon-only buttons for toolbars and bottom panel controls lack hover discoverability and screen reader compliance. This is a common pattern in complex IDE-like interfaces that must be addressed to ensure proper a11y.
**Action:** Add explicit `aria-label` and `title` attributes to all icon-only buttons in workspace views, prioritizing the primary interaction areas like sidebars and panel controls.
