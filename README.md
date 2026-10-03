# frostedblocks-lite

**ICE Lite** — https://lite.frostedblocks.com

Free social site (email or Google signup). No wallet. No tokens. Live terms: **does not run ads**. Contact: hello@frostedblocks.com.

Lite is **enough on its own**. You do not need ICE Network to use Lite.

**ICE Network** (https://frostedblocks.com) is an optional on-chain upgrade if you want a username on the Internet Computer and, later, a personal site. Separate product and codebase.

Does **not** run on ICP itself. Lite accounts, posts, and mail live on Vercel + Postgres. The public ICE Network feed can be read from the mainnet canister in `lib/ice.ts` and merged into `/api/posts` (see `CANISTER.md`). On-chain writes stay on frostedblocks.com.

```bash
npm install
npm run dev
```

Open http://localhost:3000
