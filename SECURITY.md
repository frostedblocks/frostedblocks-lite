# ICE Lite security notes

Shipped 2026-09-09 on frostedblocks-lite.

- Security headers: CSP (enforce), HSTS 2 years without includeSubDomains, COOP, CORP, no ACAO *.
- Session cookie: HttpOnly, Secure, SameSite=Lax, Path=/, 7-day TTL. New token on each login; logout and logout?all unchanged.
- Mutating `/api/*` requests must come from lite.frostedblocks.com (or the current Vercel host).
- Sign-in / sign-up / forgot are rate-limited (IP + identifier). Generic auth errors. Lockout after 5 failures.
- Passwords: scrypt + timing-safe compare, Have I Been Pwned check, never logged.
- Public feed/people JSON uses handles and names only — no email, phone, or hashes.
- Avatar uploads: signed-in only, JPG/PNG/WEBP ≤2MB, random object keys under `avatars/{userId}/`.
- `/.well-known/security.txt` added.
- Production API errors no longer return raw database messages.
