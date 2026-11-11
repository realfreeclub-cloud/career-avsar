# Indian Teacher Recruitment Platform — Foundation (Part 0)

Responsive Next.js (App Router) + TypeScript + Tailwind foundation for an Indian teacher recruitment and placement platform. This phase establishes architecture, environment/deployment scaffolding, and a reusable **Glossy Liquid Glass** design system. **No business features** are implemented yet.

## Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend/API:** Next.js Route Handlers (`src/app/api/*`)
- **Data:** MongoDB + Mongoose (connection module provided)
- **Validation:** Zod (env + API error helpers)
- **Logging:** Pino
- **Deployment target:** Docker + Nginx on a Hostinger VPS

## Getting started
```powershell
npm install
copy .env.example .env
npm run dev
```
App: http://localhost:3000  
Health: http://localhost:3000/api/health

## Scripts
- `npm run dev` — local development
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript (`tsc --noEmit`)
- `npm run build` — production build (standalone output for Docker)

## Project structure (high level)
- `src/app` — App Router pages/layouts and API routes
- `src/components/ui` — reusable design-system primitives
- `src/components/layout` — responsive shell/navigation
- `src/lib` — env, logger, DB connection, auth/authz placeholders, API helpers, utils
- `src/server/services` — server/service-layer placeholder (future business logic)
- `src/types` — shared types
- `deploy/nginx` — Nginx reverse-proxy config
- `docker-compose.yml`, `Dockerfile` — containerized deployment

## Environments
Configure via `.env` (see `.env.example`). Use separate values for development, staging, and production (never commit secrets). `NODE_ENV` supports `development|test|staging|production`.

## Responsive / accessibility baseline
Layouts/components target **320, 375, 430, 768, 1024, 1280, 1440, 1920** widths (mobile-first), avoid horizontal overflow, use ≥44px touch targets for important controls, include keyboard focus styles, and respect `prefers-reduced-motion`.

## Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- [API_STRUCTURE.md](API_STRUCTURE.md)
- [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## Status
Foundation only. Feature development begins after validation (typecheck, lint, production build, responsive/a11y checks).
