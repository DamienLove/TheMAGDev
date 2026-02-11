## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Cross-Site WebSocket Hijacking (CSWSH) in Local Tools
**Vulnerability:** Local developer tools running WebSocket servers often lack Origin validation, allowing any website visited by the developer to execute commands on their machine.
**Learning:** Even local-only tools must validate the `Origin` header to prevent malicious websites from connecting to `localhost`.
**Prevention:** Implement `verifyClient` or `handleUpgrade` checks in WebSocket servers to whitelist trusted origins (e.g., `http://localhost:5173`).
