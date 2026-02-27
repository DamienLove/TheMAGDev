## 2026-02-19 - [CRITICAL] Hardcoded Firebase Config
**Vulnerability:** Hardcoded Firebase API keys and configuration in `firebaseConfig.ts`.
**Learning:** Developers often hardcode config for convenience, especially in early stages.
**Prevention:** Always use environment variables for sensitive config from the start. Use `.env.example` to document required variables.
