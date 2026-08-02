# CarbonSnap Security Model

How CarbonSnap protects tenant data, verifies callers, and stays safe in
production. The reference implementation is `server.ts` + `firestore.rules`.

---

## Authentication & authorization

1. **Firebase Auth** (email/password, Google popup, password reset) issues ID
   tokens (~1 hour validity). Configured in `src/features/auth/AuthContext.tsx`.
2. **Client** attaches `Authorization: Bearer <idToken>` via
   `authedFetch` (`src/shared/api/client.ts`).
3. **Server** (`server.ts` `requireAuth`):
   - Verifies the token with Google Identity Toolkit `accounts:lookup`
     (in-memory 15-minute cache).
   - Unknown/failed verification → `401`.
4. **PUBLIC_PATHS** whitelist: health, license, public estimate, contact,
   roadmap, supplier-share token routes, leads/capture, community factor
   routes, verification lookups. Everything else requires a token.
   *Adding a route here is a security decision.*

## Tenant isolation

- Ledger operations are scoped by `orgId`/`periodId` in the store.
- Firestore rules: `users/{uid}` only readable/writable by the owner;
  `organisations` update/delete restricted to `ownerUid`; contact inquiries
  are create-only for anonymous users.
- Rate limiting (in-memory, per IP) on contact, estimate, lead-capture and
  tenant-sync endpoints.

## Transport & headers

- Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`; `x-powered-by` disabled.
- CSP is set in production (see `server.ts` — must allow Firebase endpoints
  and `wss://` for dev HMR).
- Body limits: 1 MB JSON, 10 MB CSV import.

## Secrets

- `.env` is git-ignored; `.env.example` is the template.
- `VITE_FIREBASE_*` values are public by design (Firebase web config).
- Server-side secrets (`FIREBASE_API_KEY`, Stripe, Resend) are server-only.

## Auditability

- Every ledger mutation appends to the audit log; reports and certificates
  carry SHA-256 checksums verifiable at `/api/verify/:certId`.
- GDPR: `POST /api/v1/privacy/purge-org-data` and compliance exports.

## Verification checklist

1. `curl /api/v1/organisations` without token → `401`.
2. With a valid token → `200`.
3. Firestore rules deny cross-tenant reads (verify with a second account).
4. No secrets in `git status` / committed files.
