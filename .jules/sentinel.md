## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Local WebSocket Hijacking (CSWSH)
**Vulnerability:** Local agent server accepted WebSocket connections from any Origin, allowing malicious websites to execute arbitrary shell commands on the developer's machine via `ws://localhost:4477`.
**Learning:** Local dev tools running servers often neglect CORS/Origin checks because they "only run locally," but browsers can bridge the gap between the open web and localhost.
**Prevention:** Always verify `Origin` header in local WebSocket servers, allowing only trusted domains (e.g., `localhost`, specific app domains) and CLI tools (missing Origin).
