## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Hardcoded Firebase Config Variables
**Vulnerability:** Firebase `apiKey` and other configuration values were hardcoded in `firebaseConfig.ts`.
**Learning:** Hardcoding project configuration secrets/identifiers makes it impossible to separate environments and manage key rotations effectively. Even though some Firebase keys are technically "public", they should not be committed directly to version control.
**Prevention:** Always use environment variables (e.g., `import.meta.env.VITE_FIREBASE_API_KEY`) for third-party service configuration, and provide examples in an `.env.example` file.

## 2025-03-09 - Cross-Site WebSocket Hijacking in Local Agent
**Vulnerability:** The local agent server (`scripts/local-agent.js`) did not validate the `Origin` header, allowing any website the user visits to connect to the agent and execute arbitrary shell commands on their machine.
**Learning:** WebSocket connections initiated from browsers automatically include an `Origin` header, but servers must explicitly validate it. Without this check, the browser's Same-Origin Policy does not protect WebSocket handshakes.
**Prevention:** Always implement a `verifyClient` callback in `WebSocketServer` configurations that strictly whitelists allowed origins (e.g., `http://localhost:3000`, `https://themag.dev`).

## 2025-03-09 - Hardcoded Secrets in Commented Code
**Vulnerability:** Platform-specific API keys (e.g., RevenueCat `iosApiKey` and `androidApiKey`) were hardcoded directly in `src/mobile/NativeConfig.tsx`, which was commented out for future use.
**Learning:** Even if code is commented out or currently unused in the web platform, any hardcoded secrets checked into version control are exposed. Attackers or automated scanners can find them in the git history or codebase.
**Prevention:** Never hardcode secrets in source files, including commented blocks or unused code. Always use environment variable placeholders (e.g., `process.env.EXPO_PUBLIC_RC_IOS_API_KEY`) to ensure secure configuration practices are maintained when the code is eventually reactivated or ported.

## 2025-03-09 - `noopener,noreferrer` on Same-Origin Popouts
**Vulnerability:** External links opened with `window.open` lacking `noreferrer` are vulnerable to Referrer leakage and Tabnabbing.
**Learning:** While it is a critical security practice to add `noopener,noreferrer` to all external links, applying these attributes to same-origin popouts where the parent application expects to maintain a reference to the child window (e.g., `DesktopWorkspace.tsx` storing the window in a ref for cross-window communication) will cause functional regressions. The `noopener` (and in some browsers `noreferrer`) attribute severs the connection between the parent and child, causing `window.open` to return a null reference.
**Prevention:** Always add `noopener,noreferrer` to external links to prevent Tabnabbing and Referrer leakage. However, DO NOT add these attributes to same-origin internal popouts that require cross-window communication or require retaining a window reference to function correctly.
