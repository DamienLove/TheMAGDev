## 2024-05-22 - Sidebar Accessibility
**Learning:** The application renders the main layout (including Sidebar) behind the authentication modal, allowing for DOM-based verification even without logging in.
**Action:** Use `page.get_by_label()` in Playwright to verify existence of accessibility attributes even if visual verification is blocked by an overlay.

## 2024-05-22 - Interactive Elements
**Learning:** Using `div` with `role="button"` requires manual keyboard event handling, which is often missed.
**Action:** Always prefer semantic `<button>` elements for interactive components to get native keyboard support for free.
