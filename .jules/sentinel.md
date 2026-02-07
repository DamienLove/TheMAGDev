## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Local WebSocket Agent CSWSH
**Vulnerability:** Local agent (shell execution) WebSocket server was vulnerable to Cross-Site WebSocket Hijacking (CSWSH) as it accepted connections from any origin.
**Learning:** Local development tools often omit security checks assuming "localhost is safe", but malicious websites can connect to localhost servers and execute commands.
**Prevention:** Always validate the `Origin` header in WebSocket servers, even for local tools. Use `http.createServer` with `handleUpgrade` for granular control.
