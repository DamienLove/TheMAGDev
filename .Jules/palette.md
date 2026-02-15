# Palette's Journal 🎨

This journal records critical UX and accessibility learnings.

## 2023-10-27 - [Example Entry]
**Learning:** Users often miss error messages that appear at the top of long forms.
**Action:** Always scroll to the first error or use inline validation.

## 2025-05-18 - [Copy Confirmation Pattern]
**Learning:** Copy actions without visual feedback leave users uncertain if the action succeeded.
**Action:** Always provide immediate visual feedback (e.g., checkmark icon, "Copied!" tooltip) for copy-to-clipboard actions.

## 2026-05-23 - [Icon-Only Button Accessibility]
**Learning:** Icon-only buttons in navigation sidebars often lack accessible names, making them invisible to screen reader users despite having tooltips for mouse users.
**Action:** Always add explicit `aria-label` attributes to icon-only buttons, even if a visual tooltip is present.
