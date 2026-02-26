# Palette's Journal 🎨

This journal records critical UX and accessibility learnings.

## 2023-10-27 - [Example Entry]
**Learning:** Users often miss error messages that appear at the top of long forms.
**Action:** Always scroll to the first error or use inline validation.

## 2025-05-18 - [Copy Confirmation Pattern]
**Learning:** Copy actions without visual feedback leave users uncertain if the action succeeded.
**Action:** Always provide immediate visual feedback (e.g., checkmark icon, "Copied!" tooltip) for copy-to-clipboard actions.

## 2025-05-20 - [Custom Toggle Accessibility]
**Learning:** Custom toggle switches (using divs/buttons) often lack `role="switch"` and `aria-checked`, making them ambiguous to screen readers.
**Action:** When creating custom toggles, always include `role="switch"` and `aria-checked={value}`, and link them to their labels using `aria-labelledby`.
