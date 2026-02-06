# Palette's Journal 🎨

This journal records critical UX and accessibility learnings.

## 2023-10-27 - [Example Entry]
**Learning:** Users often miss error messages that appear at the top of long forms.
**Action:** Always scroll to the first error or use inline validation.

## 2025-05-18 - [Copy Confirmation Pattern]
**Learning:** Copy actions without visual feedback leave users uncertain if the action succeeded.
**Action:** Always provide immediate visual feedback (e.g., checkmark icon, "Copied!" tooltip) for copy-to-clipboard actions.

## 2025-05-27 - [IDE Icon-Only Controls]
**Learning:** The IDE interface uses many dense icon-only toolbars. These often lack accessible labels, making them unusable for screen readers.
**Action:** Enforce a rule that every `button` with an icon child must have `aria-label` and `title`.
