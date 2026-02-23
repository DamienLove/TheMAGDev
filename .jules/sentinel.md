## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Cross-Site WebSocket Hijacking (CSWSH) in Local Agent
**Vulnerability:** Local agent accepted WebSocket connections from any origin, allowing malicious websites to execute arbitrary commands on the developer's machine.
**Learning:** Local development tools (like agents or CLI servers) are often overlooked in security reviews but can be critical attack vectors if they expose powerful capabilities (RCE) without origin validation.
**Prevention:** Enforce strict `Origin` header validation on all local WebSocket servers, whitelisting only trusted local and production domains.
