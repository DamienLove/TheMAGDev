# Palette's Journal 🎨

This journal records critical UX and accessibility learnings.

## 2023-10-27 - [Example Entry]
**Learning:** Users often miss error messages that appear at the top of long forms.
**Action:** Always scroll to the first error or use inline validation.

## 2025-05-18 - [Copy Confirmation Pattern]
**Learning:** Copy actions without visual feedback leave users uncertain if the action succeeded.
**Action:** Always provide immediate visual feedback (e.g., checkmark icon, "Copied!" tooltip) for copy-to-clipboard actions.

## 2025-05-23 - [Form Accessibility in Settings]
**Learning:** Configuration forms (like API keys) often rely on visual proximity for labeling, which fails for screen readers.
**Action:** Always use `htmlFor` on labels and `id` on inputs to programmatically associate them, even if they look visually connected.
