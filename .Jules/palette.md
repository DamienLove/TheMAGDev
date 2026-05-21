## 2024-03-09 - Initialization
## 2026-05-21 - Adding ARIA Labels to Icon-Only Buttons
**Learning:** Found multiple icon-only buttons across CodeEditor, AssetsManager, and UIUXDesign views using span material-symbols-rounded without aria-label or title attributes. This violates WCAG accessibility guidelines.
**Action:** Always add explicit aria-label and title attributes to buttons that only contain icons to ensure screen reader compatibility and improve usability via tooltips.
