# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2024-05-22 - [Implemented Code Splitting]
**Learning:** The application was loading all views upfront, increasing initial bundle size.  and  were successfully implemented for all top-level views.  serves as a full-screen fallback, which is acceptable but covers the sidebar during navigation.
**Action:** Use  for any new top-level views. Consider implementing a skeletal loader within  to keep the sidebar visible during view transitions in the future.

## 2024-05-22 - [Implemented Code Splitting]
**Learning:** The application was loading all views upfront, increasing initial bundle size. `React.lazy` and `Suspense` were successfully implemented for all top-level views. `LoadingScreen` serves as a full-screen fallback, which is acceptable but covers the sidebar during navigation.
**Action:** Use `React.lazy` for any new top-level views. Consider implementing a skeletal loader within `AppLayout` to keep the sidebar visible during view transitions in the future.
