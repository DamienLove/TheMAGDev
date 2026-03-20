## 2024-03-09 - Initialization

## 2024-03-20 - Ensure screen reader feedback for state-changing icon controls
**Learning:** When using state-changing icon controls (like Zoom In/Zoom Out) that only have an aria-label, screen reader users might not receive feedback on the resulting state change.
**Action:** Always combine the aria-label on the icon controls with `aria-live="polite"` on the adjacent element that displays the resulting state value, creating a complete feedback loop for screen readers.
