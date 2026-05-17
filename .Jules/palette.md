## 2024-03-09 - Initialization
## 2024-05-17 - Button Accessibility Scope
**Learning:** Adding `aria-label`s to *all* buttons indiscriminately (even those with visible text) overrides the accessible name, violates WCAG 2.5.3 (Label in Name), and masks dynamic text states from screen readers.
**Action:** When adding `aria-label` or `title` attributes for accessibility, explicitly verify that the target element is an *icon-only* button without any visible or dynamically updating text content.
