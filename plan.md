1. **Import `aiProvider` in `DesktopWorkspace.tsx`**
   - Import `aiProvider` from `../src/services/AIProvider`.

2. **Update `runLLMCommand` in `DesktopWorkspace.tsx`**
   - Replace the `setTimeout` mock with an actual call to `aiProvider.sendMessage()`.
   - The message should contain the action prompt and the `activeFileContent`.
   - Update state (`llmResponse`, `llmLoading`) based on the real response.

3. **Update `runCustomLLMPrompt` in `DesktopWorkspace.tsx`**
   - Replace the `setTimeout` mock with an actual call to `aiProvider.sendMessage()`.
   - The message should contain the `llmPrompt` and the `activeFileContent` as context.
   - Update state based on the real response.

4. **Verify functionality in bash session**
   - Ensure the modified file passes `pnpm build`.

5. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
