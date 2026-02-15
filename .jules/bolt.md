# Bolt's Journal

## 2024-05-22 - [Initial Journal Creation]
**Learning:** Journal created.
**Action:** Record critical learnings here.

## 2026-02-15 - [Barrel File Performance Impact]
**Learning:** Importing `WorkspaceProvider` from the `src/components/workspace/index.ts` barrel file caused `MonacoEditor` to be bundled into the main chunk, even though `App.tsx` only needed the provider. This defeated code-splitting efforts until the import was pointed directly to the source file.
**Action:** Always verify bundle composition when using barrel files. Import critical providers directly from their source files in the entry point (`App.tsx`) to avoid accidental bundling of heavy components.
