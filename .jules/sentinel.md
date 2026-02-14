## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2025-05-23 - CSWSH in Local Agent
**Vulnerability:** The local development agent (`scripts/local-agent.js`) did not validate the `Origin` header of incoming WebSocket connections.
**Learning:** WebSocket servers created with `ws` do not validate `Origin` by default, making them vulnerable to Cross-Site WebSocket Hijacking (CSWSH) where malicious sites can connect to `localhost`. Also, `package.json` with `"type": "module"` requires `.js` files to use ESM, but legacy code might still use `require`.
**Prevention:** Always implement `Origin` validation for WebSocket servers, especially those running on localhost. Check `package.json` for module type when editing scripts.
