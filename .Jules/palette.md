## 2024-03-09 - Initialization
## 2024-05-16 - Icon Button Accessibility
**Learning:** In the workspace layout, icon-only buttons lack consistent `aria-label` and `title` attributes, affecting screen reader accessibility and discoverability.
**Action:** All newly introduced or existing icon-only buttons (such as in DesktopWorkspace, CodeEditor, DebugPanel, AIAssistant) must have explicit `aria-label` and `title` attributes.
