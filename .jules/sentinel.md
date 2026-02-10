## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2025-02-18 - CSWSH in Local WebSocket Server
**Vulnerability:** The `local-agent` WebSocket server lacked Origin validation, allowing any website to execute arbitrary commands on the developer's machine via Cross-Site WebSocket Hijacking (CSWSH).
**Learning:** Localhost services are not implicitly secure. Browsers allow cross-origin WebSocket connections to localhost, making developers vulnerable to drive-by attacks.
**Prevention:** Always implement strict `Origin` header validation in WebSocket servers, even (and especially) for local development tools.
