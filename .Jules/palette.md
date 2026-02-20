# Palette's Journal 🎨

This journal records critical UX and accessibility learnings.

## 2023-10-27 - [Example Entry]
**Learning:** Users often miss error messages that appear at the top of long forms.
**Action:** Always scroll to the first error or use inline validation.

## 2025-05-18 - [Copy Confirmation Pattern]
**Learning:** Copy actions without visual feedback leave users uncertain if the action succeeded.
**Action:** Always provide immediate visual feedback (e.g., checkmark icon, "Copied!" tooltip) for copy-to-clipboard actions.

## 2025-05-19 - [Label Association in Complex Layouts]
**Learning:** In complex layouts where inputs are wrapped in containers for styling (e.g., relative positioning for icons), nesting inputs inside labels is often impossible. Explicit `htmlFor`/`id` association is critical and often missed.
**Action:** Always verify form inputs have an associated label, prioritizing `htmlFor`/`id` when structural nesting is not feasible.
