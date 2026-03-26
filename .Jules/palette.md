## 2024-03-09 - Initialization

## 2024-03-27 - Icon-only buttons accessibility pattern
**Learning:** Many icon-only buttons across the codebase (e.g., in the Code Editor activity bar) are missing both `aria-label` and `title` attributes, making them inaccessible to screen readers and lacking tooltip context for visual users.
**Action:** Always add both `aria-label` and `title` to `<button>` elements that only contain an icon (like a `<span className="material-symbols-rounded">`) to ensure comprehensive accessibility and usability.
