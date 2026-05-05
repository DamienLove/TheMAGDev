## 2024-03-09 - Initialization

## 2024-03-10 - Activity Bar Accessibility
**Learning:** Found several icon-only buttons in the main Activity Bar (`views/CodeEditor.tsx`) missing `aria-label` and `title` attributes, making them inaccessible to screen readers and lacking visual hover discoverability.
**Action:** When working on generic layout elements and sidebar controls in this app, prioritize explicit `aria-label` and `title` properties on all icon-only interactive controls.
