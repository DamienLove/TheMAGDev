## 2024-03-09 - Initialization
## 2024-05-03 - Icon-only buttons accessibility
**Learning:** Found a systemic pattern of icon-only buttons lacking `aria-label` or `title` attributes across multiple views (`CodeEditor.tsx`, `DesktopWorkspace.tsx`, `AssetsManager.tsx`, `UIUXDesign.tsx`, `Paywall.tsx`), creating accessibility barriers for screen reader users and missing visual hover discoverability.
**Action:** Implemented a targeted pass adding explicit `title` and `aria-label` attributes to these icon-only buttons to ensure a11y compliance and improve UX. In the future, actively check for this pattern when creating or modifying icon-only buttons.
