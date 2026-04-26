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

## 2025-04-26 - Prevent Cross-Site WebSocket Hijacking (CSWSH) in Local Agents
**Vulnerability:** The local agent WebSocket servers (`local-agent/server.js` and `scripts/local-agent.js`) used the `ws` library without validating the `Origin` header. This allowed any website (e.g., `https://evil.com`) to connect to `ws://localhost:4477` when the user visited it, enabling Remote Code Execution (RCE) on the developer's machine since the servers spawn raw shells.
**Learning:** The `ws` library does not validate origins by default. Local servers binding to `localhost` are still vulnerable to attacks from the browser if they don't explicitly reject unauthorized cross-origin requests.
**Prevention:** Always implement the `verifyClient` callback when instantiating `WebSocketServer`. Ensure it checks `info.origin` against a strict allowlist. For local dev servers, carefully handle `undefined` origins (for non-browser clients like node scripts) and dynamic local ports (e.g., using `startsWith('http://localhost:')`).
