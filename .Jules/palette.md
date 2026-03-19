## 2024-03-09 - Initialization

## 2024-05-18 - Combining ARIA Labels with Live Regions for Controls
**Learning:** Adding `aria-label` to icon-only control buttons (like Zoom In/Out) is necessary but insufficient if the resulting state change (like the zoom percentage text) isn't communicated. Screen reader users might activate the control but not know the new value.
**Action:** Always combine `aria-label` on state-changing icon controls with `aria-live="polite"` on the adjacent element that displays the resulting state value, ensuring a complete feedback loop.
