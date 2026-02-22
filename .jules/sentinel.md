## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-24 - Local WebSocket Agent CSWSH
**Vulnerability:** Local agent WebSocket servers (`scripts/local-agent.js` and `local-agent/server.js`) accepted connections from any origin, allowing malicious websites to execute arbitrary shell commands (CSWSH/RCE) on the developer's machine.
**Learning:** Local development tools that expose WebSocket interfaces are often assumed to be safe because they bind to `localhost`, but they are vulnerable to Cross-Site WebSocket Hijacking from the browser unless `Origin` is explicitly validated.
**Prevention:** Always implement strict `Origin` header validation in WebSocket servers, even for local tools, using a whitelist of allowed origins (e.g., `localhost`, production domain).
