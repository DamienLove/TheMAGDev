## 2026-04-24 - Adding ARIA labels and titles to CodeEditor icon buttons
**Learning:** The `views/CodeEditor.tsx` file contains several icon-only buttons in the activity bar, bottom panel, and floating panel headers that lack explicit `aria-label` and `title` attributes, which are crucial for screen reader accessibility compliance and visual hover discoverability.
**Action:** Add `aria-label` and `title` to all newly introduced or existing icon-only buttons in the workspace layout.
