## 2024-03-09 - Initialization
## 2026-05-20 - Adding ARIA labels to Workspace icon-only buttons
**Learning:** When developing complex IDE-like environments, utility sidebars frequently rely on Material Symbols without text labels to conserve space, making them completely opaque to screen readers.
**Action:** Always ensure any icon-only button without visible text includes both an `aria-label` for screen readers and a `title` attribute for mouse hover context.
