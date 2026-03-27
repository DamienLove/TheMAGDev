## 2024-03-09 - Initialization

## 2026-03-27 - Prevent Ambiguous Playwright Queries
**Learning:** The application uses similar labels for multiple actions (e.g. 'Explorer' vs 'Pop out Explorer').
**Action:** When querying UI elements by label in Playwright tests for this project, always use `exact=True` (e.g., `page.get_by_label('Explorer', exact=True)`) to prevent strict mode violations caused by ambiguous or multiple string matches in the DOM.
