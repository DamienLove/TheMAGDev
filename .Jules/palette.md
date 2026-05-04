## 2024-03-09 - Initialization
## 2024-05-19 - Explicit aria-label for Icon-only Buttons
**Learning:** Icon-only buttons with inner `<span>` icons are common accessibility pitfalls; without `aria-label` or `title`, screen readers provide no context. We learned that to catch all missing aria-labels we cannot just scan for simple `aria-label` but actually need to identify single-line and multiline `<button>` elements carefully checking for `title` and `aria-label`.
**Action:** Always add explicit `aria-label` and `title` to all `<button>` components that only contain a `material-symbols` span, specifically in desktop layouts and panels like `views/DesktopWorkspace.tsx`, `views/CodeEditor.tsx`, and `src/components/workspace/AIAssistant.tsx`.
