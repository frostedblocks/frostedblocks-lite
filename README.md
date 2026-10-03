# frostedblocks-lite

Free Web2 social site for [lite.frostedblocks.com](https://lite.frostedblocks.com).

ICE Lite is a free-to-post funnel into ICE Network. Sign up with email or Google and post without a wallet. Lite does not sell tokens or token packs, does not run ads, and does not require Internet Identity or ICP.

ICE Network ([frostedblocks.com](https://frostedblocks.com)) is a separate product with its own terms. This repo does not merge the two.

Lite accounts, posts, and mail run on Vercel + Postgres. The public ICE Network feed can be read from the mainnet canister in `lib/ice.ts` (see `CANISTER.md`). On-chain writes stay on frostedblocks.com.

```bash
npm install
npm run dev
```

Open http://localhost:3000
