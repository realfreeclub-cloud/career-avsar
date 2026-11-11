# Deployment (Docker + Nginx + Hostinger VPS)

## Artifacts
- `Dockerfile` — multi-stage build; Next.js `output: "standalone"` runtime image.
- `docker-compose.yml` — local/stack orchestration for `app`, `mongo`, `nginx` (adapt for production).
- `deploy/nginx/default.conf` — reverse proxy to app container, upgrade headers, static cache header for `/_next/static`.

## Environments
- **Development:** `npm run dev` with local `.env`.
- **Staging:** production build + staging `.env`/secrets + staging MongoDB; validate migrations/features before prod.
- **Production (Hostinger VPS):** Docker Engine + Compose (or equivalent), Nginx as public entrypoint, TLS via Certbot/Let's Encrypt (or managed TLS), hardened firewall, private networking for MongoDB.

## Production checklist (baseline)
1. **Secrets:** set real `AUTH_SECRET`, DB credentials, storage keys in the VPS secret store/env (never in git). Rotate defaults from `.env.example`.
2. **MongoDB:** use a managed/secured instance or hardened self-hosted Mongo with auth, backups, and restricted network access. Set `MONGODB_URI` accordingly.
3. **Build & run:**
   ```bash
   docker compose build
   docker compose up -d
   ```
   (Use a production compose override without published Mongo ports where appropriate.)
4. **TLS:** terminate HTTPS at Nginx; redirect HTTP→HTTPS; set `proxy_set_header X-Forwarded-Proto $scheme` (already present) and configure app URL/env to match public domain.
5. **Headers/security:** keep `poweredByHeader` off; add HSTS/CSP/frame/referrer policies at Nginx/app once domains and asset requirements are known.
6. **Uploads/storage:** `local` storage is ephemeral in containers unless mounted; prefer S3-compatible storage for production documents.
7. **Observability:** ship/retain Pino logs; add health checks/monitoring/alerts; monitor disk, memory, and DB.
8. **Backups:** automated MongoDB backups and restore testing.

## Nginx/TLS note
The provided Nginx config listens on port 80 for containerized/local use. For production, add a `server` block for 443 with certificates and HTTP→HTTPS redirect, or place a TLS-terminating proxy in front.

## CI/CD (recommended, not implemented in Part 0)
- Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Build/push image, deploy via SSH/Compose or orchestration, run smoke check against `/api/health`.
