## 2024-03-09 - Initialization

## 2026-03-15 - Icon-Only Button Accessibility in Studio Views
**Learning:** Icon-only buttons using Material Symbols (`<span className="material-symbols-rounded">...</span>`) are frequently missing `aria-label` and `title` attributes across newly added studio views (e.g., `views/studio/UIUXDesign.tsx`, `views/DesktopWorkspace.tsx`). This pattern makes these tools inaccessible to screen readers and removes helpful tooltips for sighted users.
**Action:** Always ensure newly created or modified icon-only buttons include descriptive `aria-label` and `title` attributes. Proactively audit other studio and workspace views for this recurring pattern.
