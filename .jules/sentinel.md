## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2026-02-08 - Local Agent CSWSH
**Vulnerability:** Local WebSocket servers without Origin validation are vulnerable to Cross-Site WebSocket Hijacking (CSWSH), allowing malicious sites to execute arbitrary commands on the developer's machine.
**Learning:** Even "local" tools running on `localhost` need strict origin validation if they accept connections from browsers.
**Prevention:** Validate `req.headers.origin` or use `verifyClient` to allow only trusted origins (e.g., `localhost` and specific production domains).
