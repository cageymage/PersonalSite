# wow-api

Standalone Cloudflare Worker that exposes live WoW raid boss kill data for a single character, pulled from the Blizzard Battle.net API. Deployed independently of the main Astro site so it can be moved to its own subdomain/host later without touching the site.

`GET /raids` returns JSON shaped like:

```json
[
	{
		"raid": "Liberation of Undermine",
		"expansion": "The War Within",
		"bosses": [
			{ "name": "Vexie and the Geargrinders", "difficulties": ["normal", "heroic"] }
		]
	}
]
```

Responses are edge-cached for 10 minutes (`CACHE_TTL_SECONDS` in `src/index.ts`) to avoid re-authenticating with Blizzard on every request.

## One-time setup: Battle.net API credentials

1. Go to [develop.battle.net](https://develop.battle.net/) and log in with a Battle.net account.
2. Create a new "Client" (API application). No special scopes are needed — the Character Encounters API is public game data, accessible via the standard OAuth2 client-credentials grant.
3. Note the generated **Client ID** and **Client Secret**.

## Local development

```bash
cd wow-api
npm install
cp .dev.vars.example .dev.vars   # then fill in real values
npm run dev
```

`wrangler dev` reads secrets from `.dev.vars` locally (this file is gitignored — never commit real credentials). The worker will be available at `http://localhost:8787`; test it with:

```bash
curl http://localhost:8787/raids
```

## Deploying manually

```bash
npx wrangler secret put BLIZZARD_CLIENT_ID
npx wrangler secret put BLIZZARD_CLIENT_SECRET
npm run deploy
```

After deploying, update `ALLOWED_ORIGIN` in `wrangler.toml` to match the real production site origin (not `*`) before shipping, and point the Astro site's `PUBLIC_WOW_API_URL` env var at the deployed Worker URL.

## Continuous deployment (GitHub Actions)

`.github/workflows/deploy-wow-api.yml` deploys this Worker automatically on every push to `main` that touches `wow-api/` (or via manual "Run workflow" dispatch). It syncs the Blizzard credentials to Cloudflare on every run (safe/idempotent — just overwrites the same secret value) and then runs `wrangler deploy`.

No credentials live in this repo. They're stored as **GitHub Actions repo secrets** (Settings → Secrets and variables → Actions → New repository secret), which GitHub encrypts at rest and automatically redacts from workflow logs:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template. Scope it to this account/Worker only, not "All accounts." |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → any Workers page → Account ID in the right sidebar. Not secret info, but kept here rather than in `wrangler.toml` so this project stays account-agnostic/portable. |
| `BLIZZARD_CLIENT_ID` | From the Battle.net API client created above |
| `BLIZZARD_CLIENT_SECRET` | From the Battle.net API client created above |

To rotate a credential later, just update the GitHub secret value and push (or manually re-run the workflow) — no local `wrangler` commands needed.

## Config

Character/realm/region and the allowed CORS origin are set as plain `[vars]` in `wrangler.toml` (safe to edit directly, no secrets there). Only the Blizzard client ID/secret are stored as Worker secrets.
