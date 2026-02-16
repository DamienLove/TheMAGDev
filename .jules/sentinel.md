## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Cross-Site WebSocket Hijacking (CSWSH) in Local Dev Tools
**Vulnerability:** Local WebSocket server (port 4477) accepted connections from any origin, allowing malicious sites to execute arbitrary commands via the local agent.
**Learning:** Local development tools that expose a WebSocket server must explicitly validate the `Origin` header. Trusting `localhost` implicitly without checks opens up the developer's machine to RCE from any website they visit while the tool is running.
**Prevention:** Implement strict `Origin` validation in WebSocket servers (e.g., allow only `localhost`, `127.0.0.1`, and trusted domains).
