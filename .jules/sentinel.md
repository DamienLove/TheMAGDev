## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2025-05-23 - Local WebSocket Agent CSWSH
**Vulnerability:** The local agent script (`scripts/local-agent.js`) exposed a WebSocket server on localhost without validating the `Origin` header, allowing any website to execute arbitrary shell commands on the developer's machine via Cross-Site WebSocket Hijacking (CSWSH).
**Learning:** Local development tools often omit security checks under the assumption they are "safe" on localhost, but browsers allow cross-origin WebSocket connections to localhost by default.
**Prevention:** Always implement strict `Origin` header validation in local development servers, ensuring only trusted origins (e.g., specific localhost ports or the app's production domain) can connect.
