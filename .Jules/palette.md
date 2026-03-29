## 2024-03-09 - Initialization

## 2026-03-29 - Add live regions for state-changing controls
**Learning:** When adding aria-labels to state-changing icon controls (like zoom buttons), the adjacent element displaying the resulting state must have aria-live="polite" to ensure a complete screen reader feedback loop.
**Action:** Always combine aria-labels on state-changing controls with aria-live="polite" on the resulting state display.
