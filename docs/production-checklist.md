## Production Launch Checklist

- **Domain & Email Authentication**
  - Register your domain and set up SPF, DKIM, and DMARC.
  - Verify DNS is propagated and passes checks (SPF softfail/hardfail avoided, DKIM aligned, DMARC policy set to at least `p=quarantine` initially).

- **AMP for Email Sender Registration**
  - Gmail: register and get approved for AMP sending — `https://developers.google.com/gmail/ampemail/register`.
  - Yahoo Mail: whitelist sender for AMP — `https://senders.yahooinc.com/AMP/`.
  - Mail.ru: follow AMP registration — `https://postmaster.mail.ru/amp/`.

- **Background Jobs & Matching**
  - Use Redis-backed queues (Bull/BullMQ) for heavy matching jobs and long-running tasks.
  - Run workers as separate processes/containers; monitor queue depth and failures.

- **Embeddings & Vector Database**
  - Use a managed vector DB for scale and latency: Pinecone, Weaviate, or PGVector.
  - Batch upserts, version embedding models, and backfill on model upgrades.

- **Security, Keys, Limits, and Observability**
  - Rotate API keys regularly; enforce key restrictions (IP, referrer, scopes).
  - Implement rate limiting and request validation on all public endpoints.
  - Centralized logging and error tracking: Sentry for app errors; metrics with Prometheus/Grafana.
  - Schedule automated backups and PITR for MongoDB; test restores.

- **Secure File Handling (Resumes & Sensitive Docs)**
  - Store files in secure buckets with private ACL; use short-lived signed URLs.
  - Never return full resume URLs to unauthorized users; authorize per-request.
  - Encrypt at rest and in transit; scrub PII from logs and exports.


