# Production Readiness Report — Tabla (QR Menu SaaS)

_Audit date: 2026-06-05 · Scope: `web/` Next.js app · Method: build, typecheck, lint, dependency audit, and manual security review._

## Verdict: ⚠️ Almost — not yet. Fix the blockers below first.

The **infrastructure and security foundations are strong** (validated env, strict CSP/HSTS, rate limiting everywhere, HMAC-verified webhooks, tenant isolation, bcrypt-12). The build is green and types are clean. But it is **not production-ready as-is** because of: **no automated tests**, **6 lint errors** (two are real React-correctness issues), **critical paid-SaaS integrations are optional at boot**, and **one moderate dependency CVE**. None are deep architectural problems — they're a focused punch-list.

---

## Evidence (checks run)

| Check | Command | Result |
|---|---|---|
| Production build | `npm run build` | ✅ Pass (all routes compiled) |
| Type safety | `npm run typecheck` (`tsc --noEmit`) | ✅ Clean, 0 errors |
| Lint | `npx eslint src` | ❌ **6 errors, 35 warnings** |
| Tests | — | ❌ **None** (empty `tests/`, no runner, no `test` script) |
| Dependency audit | `pnpm audit` | ⚠️ **1 moderate** (postcss < 8.5.10, XSS in CSS stringify) |
| Secrets in git | `git ls-files \| grep .env` | ✅ None tracked; `.env*` gitignored |
| `console.log` in src | grep | ✅ 0 |
| `dangerouslySetInnerHTML` | grep | ✅ 0 |
| Raw SQL | `$queryRawUnsafe` (4 uses) | ✅ Parameterized (`ANY($1::uuid[])`), injection-safe |

---

## ✅ What's solid (verified)

- **Env validated at boot** — `src/config/env.ts` parses all vars with Zod and throws on invalid; app refuses to start misconfigured.
- **Security headers** (`src/lib/security/headers.ts`, applied in `src/proxy.ts`): nonce-based CSP with `strict-dynamic` in prod, HSTS (2y + preload), `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy.
- **Rate limiting** — global limiter on every edge request in `proxy.ts`, plus named limiters (`auth`, `payment`, `webhook`, `order`, `public`) enforced per server action / route.
- **Payment webhook** (`api/paymob/webhook`) — verifies HMAC **before** acting, audits rejected attempts, and idempotency is guaranteed by `Payment.providerTransactionId @unique`.
- **Tenant isolation** — owner mutations derive `restaurantId` from the session via `requireOwnerRestaurant()`, never from the client; upload DELETE enforces the caller's `restaurants/<id>/` key prefix.
- **Passwords** — bcrypt, 12 rounds (`src/lib/auth/password.ts`).
- **Uploads** (`api/uploads/image`) — auth + rate limit + scope allowlist + size cap (`MAX_UPLOAD_BYTES`) + re-encode to WebP (re-encoding neutralizes malicious payloads).
- **No secrets committed**, no `console.log`, no `dangerouslySetInnerHTML`, raw SQL is parameterized.

---

## 🚫 Blockers — fix before launch

1. **No automated tests.** `tests/unit` and `tests/integration` exist but are **empty**; there is no test runner (no vitest/jest/playwright) and no `test` script. For a payment-handling, multi-tenant SaaS this is the top risk. **Minimum bar:** add a runner (Vitest) and cover the money/security paths — `OrderService.placeOrder`, `PaymentService.handlePaymobWebhook` (HMAC + idempotency), `ThemeService.isEntitled`, tenant-isolation in repositories, and `env.ts` failure.

2. **6 ESLint errors** (`npx eslint src --quiet`). The project's own rules are violated, and two are genuine React-correctness smells:
   - `components/shared/turnstile-widget.tsx` — refs updated during render (this is the **bot-protection** widget; verify it still validates).
   - `components/owner/donut-chart.tsx` — variable reassigned after render completes.
   - `app/(admin)/admin/packages/packages-grid.tsx` — file > 200 lines (hard limit).
   - `app/(owner)/dashboard/menu/items-panel.tsx` — unused `Link` import.
   - `components/owner/instapay-modal.tsx` — unescaped `'` entity.
   > Note: `next build` does **not** gate on lint here, so these ship silently. Add lint to CI.

3. **Critical integrations are `.optional()` in `env.ts`.** Payment (`PAYMOB_*`), storage (`R2_*`), email (`RESEND_API_KEY`), and **bot protection** (`TURNSTILE_*`) can all be absent and the app still boots. A live paid SaaS would then silently run without payments / image uploads / Turnstile. **Fix:** make these **required when `NODE_ENV=production`** (Zod `superRefine`), or fail fast at the relevant call site.

4. **Dependency CVE** — `postcss < 8.5.10` (moderate, GHSA-qx2v-qp2m-jg93). Resolve via `pnpm update postcss` / overrides and re-run `pnpm audit`.

---

## 🔧 Recommended (before or shortly after launch)

- **Unvalidated public env vars:** `NEXT_PUBLIC_INSTAPAY_PHONE`, `NEXT_PUBLIC_EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY` are read in `instapay-modal.tsx` / `instapay-test-card.tsx` but are **not** in `env.ts` or (likely) `.env.example`. Document them and add to `public-env.ts`. Note the InstaPay flow emails via **client-side EmailJS** — fine for MVP, but it exposes the template to the browser and can't be rate-limited server-side.
- **CI pipeline** — there's no `.github/workflows`, `Dockerfile`, or `vercel.json`. Add a CI that runs `typecheck → lint → test → build` on every PR so the gaps above can't regress.
- **DB migrations** — schema is applied via `prisma db push` (no migration history). For production, switch to `prisma migrate` so changes are versioned, reviewable, and reversible.
- **Confirm Turnstile is enforced** on signup/login/contact/reset (CLAUDE.md requires it). Since the keys are optional, verify the forms actually reject missing/invalid tokens server-side.
- **`max-lines` / complexity warnings** (35) in theme item-modals, `Dish`, `preview-modal`, etc. — non-blocking, but trim per the project's 80-line/complexity-12 rules.
- **Observability** — pino logger is in place; wire it to a sink (and confirm `redact` paths cover `customerPhone`, `deliveryAddress`, and the new order PII) plus an error tracker (e.g. Sentry).

---

## 🚀 Deployment notes (gotchas found during this work)

- **Public menu caching:** `/t/[slug]` is cached via `unstable_cache` tagged `publicMenuTag(slug)`. Any new owner mutation that changes the live menu **must** call `revalidatePublicMenu(ctx.slug)` (see `src/lib/cache/public-menu-cache.ts`), or edits won't appear until the TTL. This Next build uses **`updateTag`** (read-your-own-writes), not the standard `revalidateTag`.
- **Prisma on Windows:** `db:generate` / `db:push` fail with `EPERM` (locked query-engine DLL) while `next dev` is running — stop the dev server first. (Not an issue on Linux CI/hosts.)
- **Order schema** was just extended (`fulfillmentType`, customer/address, `deliveryLat/Lng`) and pushed — ensure the production DB gets the same schema before deploying this build.

---

## Pre-launch checklist

- [ ] Add Vitest + tests for payment webhook, order placement, entitlement, tenant isolation, env validation
- [ ] Fix the 6 ESLint errors; add `lint` + `typecheck` + `test` to CI
- [ ] Make `PAYMOB_*`, `R2_*`, `RESEND_API_KEY`, `TURNSTILE_*` required in production
- [ ] `pnpm update postcss` → `pnpm audit` clean
- [ ] Add `NEXT_PUBLIC_EMAILJS_*` / `NEXT_PUBLIC_INSTAPAY_PHONE` to `env`/`.env.example`
- [ ] Switch to `prisma migrate` (versioned migrations) and apply to prod DB
- [ ] Verify Turnstile rejects missing tokens on all public forms
- [ ] Set production env vars (see below); rotate any secret ever pasted in chat
- [ ] Point logger to a sink + add error tracking; confirm PII redaction
- [ ] Smoke test on a real domain: signup → onboarding → publish menu → place dine-in & delivery order (WhatsApp + map link) → pay for a theme (Paymob sandbox → live)

## Required production environment variables

**Must be set:** `DATABASE_URL`, `NEXTAUTH_SECRET` (≥32 chars), `NEXTAUTH_URL`, `APP_ROOT_DOMAIN`, `APP_PUBLIC_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

**Should be required for a live SaaS (currently optional):** `PAYMOB_API_KEY`, `PAYMOB_HMAC_SECRET`, `PAYMOB_INTEGRATION_ID`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

**Optional:** `GOOGLE_CLIENT_ID/SECRET` (OAuth), `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYMOB_APPLE_PAY_INTEGRATION_ID`, `PAYMOB_IFRAME_ID`, `LOG_LEVEL`.

---

_This report reflects the codebase at audit time. Re-run the checklist after addressing the blockers._
