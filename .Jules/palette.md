## 2024-03-09 - Initialization
## 2024-05-24 - Activity Bar Accessibility
**Learning:** Icon-only activity bar buttons in IDE views (like CodeEditor) often lack `aria-label` and `title` properties, making them inaccessible to screen readers and difficult for users to identify without tooltips. Strict mode violations in Playwright can occur if multiple elements share the same generic aria-label (e.g., "Extensions").
**Action:** Always ensure icon-only buttons include both `aria-label` (for screen readers) and `title` (for visual tooltips), and use specific locators (e.g., scoping to `aside.w-12`) when verifying UI elements in tests to avoid ambiguous matches.
