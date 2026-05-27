# Tabla — QR Menu SaaS (`web`)

Next.js 16 + React 19 multi-tenant SaaS. Bilingual (EN/AR), RTL-aware, mobile-first.

## Quick start

```bash
# 1. Install deps
pnpm install

# 2. Configure env
cp .env.example .env.local
# Fill DATABASE_URL (Supabase/Neon), UPSTASH_REDIS_*, NEXTAUTH_SECRET (`openssl rand -base64 32`)

# 3. Generate Prisma client & push schema
pnpm prisma generate
pnpm prisma db push

# 4. Run
pnpm dev
```

Visit `http://localhost:3000`.

## Architecture (see `../plan.md` and `../design-brief.md`)

```
src/
├── app/             # Next.js App Router (thin)
├── domain/          # Entity types
├── dtos/            # Zod schemas + DTOs
├── repositories/    # Data access (Prisma)
├── services/        # Business logic
├── controllers/     # Route handler helpers
├── themes/          # Pluggable diner themes
├── integrations/    # Paymob, WhatsApp, R2, Sharp adapters
├── i18n/            # next-intl config + locale JSON
├── lib/             # errors, logger, security, auth, tenant
├── config/          # Typed env + constants
├── components/      # UI only (no business logic)
└── hooks/
```

## Security

- **CSP + HSTS + XFO** set in `middleware.ts` per request, with a fresh nonce.
- **Rate limiting** via Upstash on every edge hit + dedicated limiters for auth, payment, webhook, order endpoints (`src/lib/security/rate-limiter.ts`).
- **Password hashing** with bcrypt (12 rounds).
- **Input validation** with Zod at every API boundary.
- **No `process.env` in business code** — typed access through `@/config/env`.

## Code quality

- TypeScript strict mode.
- ESLint `max-lines: 200` per file.
- One class/component per file.
- TSDoc on every public function/class/method.
- All user-facing strings in `src/i18n/locales/{en,ar}.json` — no hardcoded copy.
- Themes must use Tailwind logical utilities (`ms-`, `me-`, `ps-`, `pe-`) — enforced by ESLint.

## Phase status

- ✅ Phase 0 — Foundations
- ⏳ Phase 1 — Core menu MVP (next)
- Phase 2 — Theme gallery + Paymob
- Phase 3 — Admin dashboard
- Phase 4 — Analytics + polish
