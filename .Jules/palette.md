## 2024-03-09 - Initialization

## 2024-05-23 - Screen reader loop for zoom controls
**Learning:** When using state-changing icon controls like zoom in/out, simply adding `aria-label` to the buttons is not enough. The screen reader user needs immediate feedback on the result of their action.
**Action:** When adding `aria-label` to state-changing icon controls, always combine it with `aria-live="polite"` on the adjacent element displaying the resulting state value to ensure a complete feedback loop.
