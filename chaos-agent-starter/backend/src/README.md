## Backend notes

Current starter endpoints are intentionally small. Before production or a hackathon demo with real user data:
- Add authentication middleware and verify Supabase JWTs.
- Add row-level security policies and user-scoped conversation/artifact queries.
- Implement tool calling and actual web search using the enabled provider capability.
- Add durable cloud history and local/cloud synchronization.
- Add PDF validation and bounded repair workflow.
- Add email idempotency/reconciliation for uncertain outcomes.
- Add rate limiting, request logging with redaction, file-size limits and tests.
