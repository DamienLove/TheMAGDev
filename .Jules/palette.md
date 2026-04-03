## 2024-03-09 - Initialization

## 2026-04-03 - Adding ARIA attributes to UI UX Design tool
**Learning:** Icon-only buttons used in the Visual Studio designer, such as zoom, move and device selector tools, lack accessible names, making it impossible for screen reader users to understand their purpose.
**Action:** Add explicit `aria-label` attributes to all icon-only buttons, and pair zoom controls with an `aria-live="polite"` element for immediate screen reader feedback on state changes.
