## 2024-03-09 - Initialization
## 2026-04-08 - Adding Accessible Labels to Layout Controls
**Learning:** Found that layout-related icon buttons (like Activity Bar icons and bottom panel controls) are completely opaque to screen readers when they rely solely on icons. Missing labels break core navigation for assistive tech.
**Action:** Always verify icon-only layout controls (like Sidebars, Bottom Panels) use both `aria-label` (for screen readers) and `title` (for mouse hover discoverability).
