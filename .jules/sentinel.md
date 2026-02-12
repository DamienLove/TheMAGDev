## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-06-03 - Cross-Site WebSocket Hijacking (CSWSH) in Local Dev Tools
**Vulnerability:** A local development WebSocket server (`scripts/local-agent.js`) did not validate the `Origin` header.
**Learning:** Even local-only development tools are vulnerable if they open a WebSocket server. A malicious website can connect to `ws://localhost:PORT` from a victim's browser and execute commands. The browser *always* sends an `Origin` header for cross-site requests, making validation straightforward.
**Prevention:** Always validate `req.headers.origin` in WebSocket servers, even for local tools. Whitelist `localhost`, `127.0.0.1`, and trusted production domains.
