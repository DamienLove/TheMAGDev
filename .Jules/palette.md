## 2024-03-09 - Initialization

## 2024-04-12 - Missing ARIA Labels on Icon-Only Layout Buttons
**Learning:** Icon-only buttons used for primary layout navigation (Activity Bar and Bottom Panel controls) frequently lack `aria-label` and `title` attributes, making them undiscoverable to screen readers and difficult to understand without hover tooltips.
**Action:** When adding or reviewing layout controls, explicitly define both `aria-label` for screen readers and `title` for hover tooltips on any icon-only button to ensure full accessibility and usability compliance.
