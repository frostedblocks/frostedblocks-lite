# Circles → ICE Network handoff pack

For Grok Build / Elon Bot when wiring Lite Circles to ICE Network.

## Product rules (locked)

1. **Public feed stays public.** Circles never write to `lite_posts` or the public ICE stream.
2. **One Lite circle → one Network canister room** on claim (not a dump into global feed).
3. **Guest links** let friends join/read without Internet Identity; II only when someone claims/owns.
4. **Do not say “encrypted” in UI** until post bodies are real ciphertext (member keys). Membership-gated API ≠ encryption.
5. **Destination chip always visible** in compose: **Public** vs **this Circle**. Never silent-default to public.
6. **Claim CTA** stays disabled / “Coming soon” until claim is wired.

## Live fee / Factory (Elon Bot)

- New Network accounts: **5 ICP** one-time Join when registration fee is on.
- Suggested CTA copy (button disabled until live):
  > Claim on ICE Network — own this room on a canister. New Network accounts: 5 ICP one-time Join. Friends can stay on guest links.
- Do **not** say “Factory Join” in user-facing copy.
- Before minting a circle room canister: run **Factory mint capacity checks** (same ops path as other Network rooms).

## Lite Circles v1 shape (already in PR)

### Tables (Postgres / Neon) — separate from public feed

- `lite_circles` — `id`, `slug`, `name`, `owner_id`, `invite_token`, `created_at`
- `lite_circle_members` — `(circle_id, user_id)`, `role` (`owner`|`member`)
- `lite_circle_posts` — `id`, `circle_id`, `author_id`, `content`, `created_at`

**Hard rule:** circle posts only insert into `lite_circle_posts`. Public compose only inserts into `lite_posts`. Circle POST API rejects `public: true` / `toPublic: true`.

### Routes

- `GET/POST /api/circles` — list mine / create
- `GET /api/circles/[slug]?i=` — meta (invite or membership)
- `POST /api/circles/[slug]/join` — `{ invite }`
- `GET/POST/DELETE /api/circles/[slug]/posts` — members only

### UI

- `/circles` — list + create (“Create a room for 10 people”)
- `/c/[slug]?i=…` — join + room feed + locked Circle chip
- Feed compose — Public / Circle name chips
- Nav — Circles tab

## Encryption target (next Lite work before “private” hard)

- Encrypt `lite_circle_posts.content` (or stop storing plaintext).
- Circle key held by members only (device-bound); never store the circle key in Lite DB plaintext.
- On Network claim: **ciphertext + member list on the circle canister**; keys only with members (device/II-bound). Never put plaintext or the circle key in Lite’s DB or the public ICE stream.

## Design section (Chief of Staff)

- Empty `/circles`: “Create a room for 10 people,” then share guest link.
- Empty circle feed: “No posts yet. Say hello to the room.”
- Accidental-public: chip always visible; circle room locks destination; copy says “not public.”
- Until ciphertext ships: say **private room** / **members only**, not **encrypted**.
- Claim block: Coming soon + 5 ICP line above; button disabled.

## Grok Build acceptance checks

- [ ] Claim creates/maps **one** canister room per Lite circle
- [ ] Circle history does **not** appear in public ICE feed
- [ ] Guest links still work for non-II friends after claim (read/participate per product rules)
- [ ] Factory capacity check before mint
- [ ] Fee UI shows **5 ICP** Join when fee is on
- [ ] No plaintext circle bodies on Lite after encryption cutover

## Out of scope for Circles v1 merge

- Live Network claim
- End-to-end ciphertext
- SMS / phone signup
