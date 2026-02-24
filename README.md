# BlogSpace — Secure Blog Platform

A production-ready blog platform built for the Rival Full-Stack TypeScript assessment.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS, TypeScript (strict), Prisma ORM, PostgreSQL |
| Background Jobs | BullMQ + Redis |
| Auth | JWT (access token 15m) + Refresh token (HttpOnly cookie, 7d) |
| Rate Limiting | @nestjs/throttler (60 req/min default) |
| Logging | Pino (structured JSON) |
| Frontend | Next.js 15 App Router, TypeScript |
| Styling | Tailwind CSS |
| Deployment | Railway (backend + DB + Redis), Vercel (frontend) |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, REDIS_HOST/PORT
npm install
npx prisma migrate deploy
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
npm install
npm run dev
```

Visit `http://localhost:3000`

## Architecture Decisions

### Auth
- **Access token (JWT, 15 min)** kept in memory / sessionStorage — short-lived, stateless.
- **Refresh token (JWT, 7 days)** stored in an HttpOnly cookie — immune to XSS, auto-sent on refresh calls. The edge middleware redirects unauthenticated users before the React app loads.

### Async Job Processing
When a blog is published, `BlogsService` enqueues a `blog-summary` job via BullMQ. The HTTP request returns immediately. A background worker picks up the job, calls the [Blog Summary Generator](https://cortexone.rival.io) function deployed on Rival's CortexOne platform, and writes the result back to `blog.summary`. If CortexOne is unavailable, a fallback extracts the first 3 sentences.

### N+1 Prevention
The public feed uses a single Prisma `findMany` with `_count: { select: { likes, comments } }` and `select: { user: { select: { id, email } } }`. No extra queries per blog.

### Why Prisma over raw SQL
Type-safe query building means the compiler catches wrong field names at build time. Migrations are version-controlled and reproducible. The tradeoff is less control over complex SQL — acceptable for this scope.

## Tradeoffs

| Decision | Alternative | Why this |
|---|---|---|
| Refresh token in HttpOnly cookie | Access token in localStorage | XSS-resistant; tokens never accessible via JS |
| Pagination (page numbers) | Infinite scroll | Simpler, better for SEO, no cursor/offset sync issues |
| BullMQ worker in same process | Separate worker service | Simpler deployment; split if job volume grows |
| sessionStorage for access token | In-memory only | Survives tab refresh without extra round-trips |

## What I'd Improve
- Full-text search via PostgreSQL `tsvector` on `Blog.title` + `content`
- Image upload for blog posts (S3/R2 + presigned URLs)
- WebSocket for real-time comments (`socket.io` or SSE)
- Blog versioning / draft history
- Admin panel for moderation

## Scaling to 1M Users

1. **Horizontal NestJS replicas** behind a load balancer (Railway autoscaling or Kubernetes). Stateless JWT means any replica handles any request.
2. **Read replicas** on PostgreSQL — feed queries go to replica, writes go to primary.
3. **Redis cache** for `GET /public/feed` with 30-second TTL. Cache invalidated on new publish.
4. **BullMQ workers as separate service** — scale workers independently of the API.
5. **CDN + SSR** — Next.js ISR (Incremental Static Regeneration) for individual blog pages, served from edge.
6. **PgBouncer** for connection pooling — PostgreSQL has a hard limit on connections; pooling handles burst traffic.
7. **Observability** — Pino logs → any log aggregator (Datadog / Loki), structured JSON makes querying easy.
