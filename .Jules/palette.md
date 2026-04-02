## 2024-03-09 - Initialization
## 2024-04-02 - Activity Bar Accessibility
**Learning:** Icon-only buttons used for primary navigation and state changes (like the IDE activity bar) completely lack context for screen reader users if `aria-label` or `title` attributes are missing. These attributes are essential for both immediate context via tooltips (`title`) and proper accessibility tree descriptions (`aria-label`).
**Action:** Always ensure any icon-only button, especially those that toggle application states or views, has explicit `aria-label` and `title` attributes defined in the component markup.
