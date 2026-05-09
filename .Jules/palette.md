## 2024-03-09 - Initialization
## 2024-05-09 - Accessible Icon-only Buttons
**Learning:** Icon-only sidebar buttons in CodeEditor and DesktopWorkspace components frequently lacked accessible names (aria-label) and visual tooltips (title), creating a persistent pattern of accessibility/discoverability issues.
**Action:** Always ensure newly introduced or modified icon-only interactive elements in the workspace layout explicitly include `aria-label` and `title` attributes.
