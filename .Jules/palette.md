## 2024-03-09 - Initialization

## 2024-04-20 - Missing ARIA Labels on Icon-only Workspace Controls
**Learning:** Icon-only buttons used in core workspace layouts (like the activity bar and bottom panel headers) frequently lack `aria-label`s despite having visual icons or `title` attributes. This breaks screen reader accessibility for critical navigation controls.
**Action:** Always verify that icon-only buttons (`<button><span className="material-symbols-rounded">...</span></button>`) include explicit `aria-label` attributes for screen readers, even if a `title` attribute is present for visual hover feedback.
