## 2024-03-09 - Initialization

## 2024-05-24 - Missing ARIA Labels in New Studio Components
**Learning:** Found an accessibility pattern issue where newly added studio views (specifically `AssetsManager.tsx`) were missing `aria-label` attributes on icon-only buttons, despite existing components maintaining this standard.
**Action:** When creating or reviewing new views (especially in the `views/studio` directory), explicitly check that all icon-only interactive elements contain proper ARIA labels to ensure screen reader accessibility compliance.
