## 2024-05-22 - Hardcoded Third-Party API Keys
**Vulnerability:** Hardcoded RevenueCat API key in React hook.
**Learning:** Developers often hardcode "public" keys (like RevenueCat or Firebase) directly in components/hooks for convenience, but this prevents environment separation (test vs prod) and makes rotation difficult.
**Prevention:** Always use environment variables (e.g., `VITE_APP_KEY`) even for public keys, and enforce this via lint rules or code reviews.

## 2024-05-23 - Local Agent Remote Code Execution via CSWSH
**Vulnerability:** The local agent script (`scripts/local-agent.js`) exposes a WebSocket server that executes shell commands without verifying the `Origin` header.
**Learning:** Local development tools that expose servers (especially those with shell access) must validate the `Origin` header to prevent malicious websites from hijacking the connection (Cross-Site WebSocket Hijacking) and executing arbitrary code on the developer's machine.
**Prevention:** Implement strict `Origin` header validation in WebSocket servers, whitelisting only trusted domains (e.g., `localhost`, specific app domains).
