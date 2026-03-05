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
