## 2024-03-09 - Initialization

## 2026-01-30 - Missing ARIA Labels on Workspace Controls
**Learning:** Many interactive icon-only buttons in the core workspace layouts (like DesktopWorkspace.tsx, AIAssistant.tsx, DebugPanel.tsx) lacked `aria-label` attributes or robust descriptions, making them inaccessible to screen readers despite having visual icons or basic `title` tooltips.
**Action:** When adding or reviewing icon-only controls in the workspace UI, always ensure explicit `aria-label`s are added. This provides both accessibility context for screen readers and acts as a semantic label for automated testing.
