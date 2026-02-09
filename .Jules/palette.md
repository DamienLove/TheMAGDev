# Palette's Journal 🎨

This journal records critical UX and accessibility learnings.

## 2023-10-27 - [Example Entry]
**Learning:** Users often miss error messages that appear at the top of long forms.
**Action:** Always scroll to the first error or use inline validation.

## 2025-05-18 - [Copy Confirmation Pattern]
**Learning:** Copy actions without visual feedback leave users uncertain if the action succeeded.
**Action:** Always provide immediate visual feedback (e.g., checkmark icon, "Copied!" tooltip) for copy-to-clipboard actions.

## 2025-05-20 - [Semantic Elements for Accessibility]
**Learning:** Using `div` with `onClick` for interactive elements (like avatars) excludes keyboard users and requires manual tabindex/role management.
**Action:** Always use `<button>` for clickable elements, even if they look like images or containers. It provides native keyboard support and focus states for free.
