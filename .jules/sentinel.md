## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Local Agent CSWSH Vulnerability
**Vulnerability:** The local development agent (`scripts/local-agent.cjs`) ran a WebSocket server without any `Origin` header validation, allowing any website visited by the developer to connect and execute arbitrary shell commands via the agent.
**Learning:** Local development tools that expose services on `localhost` are prime targets for Cross-Site WebSocket Hijacking (CSWSH) if they don't validate the `Origin` header. Developers often assume `localhost` is safe because it's not exposed to the internet, but browsers can still bridge the gap.
**Prevention:** Always implement strict `Origin` validation in WebSocket servers, especially for local dev tools. Use a whitelist of trusted origins (e.g., `http://localhost:3000`, `https://your-production-domain.com`).
