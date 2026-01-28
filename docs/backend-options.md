# Backend Options (Mobile + Web Shared)

This project currently uses Firebase for auth and profile data. The native app connects to the same Firebase project. If we switch backends, update the mobile adapter and the web services together.

Decision criteria:
- Total cost at expected usage (requests, storage, bandwidth).
- Real-time sync requirements.
- Built-in auth vs. external auth.
- Operational overhead (managed vs. self-hosted).
- Team size and deployment workflow.

Candidates to evaluate:
- Firebase: fastest path (already integrated), rich managed services.
- Supabase: managed Postgres + Auth + Storage, open-source.
- Appwrite: open-source and self-hostable; managed cloud also available.
- Nhost: Postgres + GraphQL + Auth, managed or self-hosted.
- Convex: real-time backend with strong DX; usage-based pricing.
- PocketBase: self-hosted single binary backend for small/medium scale.
- Cloudflare Workers + D1 + R2: low-latency edge stack; requires custom API/auth.

Next steps:
1) Select the primary backend.
2) Implement adapters in web + mobile for the chosen backend.
3) Migrate data (users, profiles, modules) if switching away from Firebase.
