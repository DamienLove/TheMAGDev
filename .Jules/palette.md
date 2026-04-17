## 2024-03-09 - Initialization

## 2025-02-14 - Accessible Icon-Only Buttons in Workspaces
**Learning:** In complex views like CodeEditor, conditionally rendered layouts and floating panels contain numerous icon-only controls that are critical for layout navigation but often lack screen-reader context. The missing `aria-label` creates accessibility barriers, while missing `title` properties hurt visual discoverability for new users navigating intricate workspace interfaces.
**Action:** Consistently enforce the addition of paired `aria-label` and `title` attributes on all icon-only buttons spanning workspace views, especially in conditionally rendered or floating UI structures.
