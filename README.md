# frostedblocks-lite

Web2 site for lite.frostedblocks.com.

Does **not** run on ICP itself. Lite accounts, posts, and mail live on Vercel + Postgres. The public ICE Network feed is read from the mainnet canister in `lib/ice.ts` and merged into `/api/posts` (see `CANISTER.md`). On-chain writes stay on frostedblocks.com.

```bash
npm install
npm run dev
```

Open http://localhost:3000
