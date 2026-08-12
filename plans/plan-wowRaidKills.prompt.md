# Add a WoW Raid Kills tab (live Blizzard API, via a portable Cloudflare Worker)

## Context

The user wants a new tab on their personal Astro site listing World of Warcraft raid bosses/difficulties killed on their character (Cageymage - Thrall - US), grouped by raid tier. The data should be genuinely live (fetched from Blizzard's API on each page view), not baked in at build time.

The site (`PersonalSite`) is static-first per `CLAUDE.md` — no backend, no server-side services. A true live fetch on every page view requires a backend of some kind, which is a deliberate, acknowledged deviation from that convention. The user explicitly wants this backend piece kept in a **separate, portable location** — not woven into the Astro app — so it can later be pulled out and hosted on its own subdomain independent of the main site. Decisions made with the user:

- Live fetch happens via a small **Cloudflare Worker**, not a build-time fetch and not a Vercel function tied to the main site's host.
- The Worker lives in a **subfolder of this repo** (`wow-api/`) with its own `package.json`/deploy config, isolated from the Astro app, so it can be `git subtree split` or copied into its own repo later with minimal changes.
- The Astro page stays static; it calls the Worker via a client-side `fetch()` at page load, since a fully static Astro build has no way to reach out to Blizzard itself at request time.
- No Battle.net developer app exists yet — plan includes creating one.

## Architecture

```
Browser (/wow page)  --fetch()-->  Cloudflare Worker (wow-api/)  --OAuth + REST-->  Blizzard Battle.net API
```

1. **Cloudflare Worker** (`wow-api/`) holds the Blizzard client ID/secret as Worker secrets, performs the OAuth2 client-credentials exchange, calls the Character Encounters (Raids) API for Cageymage-Thrall-US, transforms the response into a compact JSON shape, and returns it with CORS headers so the Astro site's origin can call it from the browser. Response is edge-cached briefly (via the Workers Cache API, ~5–10 min TTL) so repeat page loads don't hammer Blizzard's OAuth endpoint or risk rate limits.
2. **Astro page** (`src/pages/wow.astro`) renders a static shell (layout, headings, loading state) and a small inline `<script>` that fetches JSON from the Worker's URL at runtime and renders raid → boss → difficulty-badge groups into the DOM.

## Blizzard API details (for the Worker implementation)

- OAuth token: `POST https://us.battle.net/oauth/token`, `grant_type=client_credentials`, HTTP Basic auth with `client_id:client_secret`.
- Data: `GET https://us.api.blizzard.com/profile/wow/character/thrall/cageymage/encounters/raids?namespace=profile-us&locale=en_US&access_token={token}` (realm slug and character name lowercased). Verify exact field names against Blizzard's current docs during implementation — response shape is roughly `expansions[].instances[].instance.name` (raid name) and `.modes[]` per difficulty (`NORMAL`/`HEROIC`/`MYTHIC`) each with `progress.encounters[]` (boss name + kill count/timestamp).
- Worker transforms this into something like:
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

## Files to add/change

**New: `wow-api/` (Cloudflare Worker, standalone project)**
- `wow-api/package.json` — own deps (`wrangler` as devDependency), own scripts (`dev`, `deploy`)
- `wow-api/wrangler.toml` — worker name, compatibility date; no secrets committed
- `wow-api/src/index.ts` — fetch handler: get/cache OAuth token, call Blizzard raids endpoint, transform response, set CORS headers (allow the site's origin), cache final JSON via `caches.default` with a short TTL
- `wow-api/.dev.vars.example` — template documenting `BLIZZARD_CLIENT_ID` / `BLIZZARD_CLIENT_SECRET` for local `wrangler dev`
- `wow-api/.gitignore` — ignore `.wrangler/`, `node_modules/`, `.dev.vars`
- `wow-api/README.md` — setup steps: create a Battle.net app at develop.battle.net (Game Data API access, no special scopes needed for public character data), `wrangler secret put BLIZZARD_CLIENT_ID`/`SECRET` for the deployed worker, `.dev.vars` for local dev, `wrangler dev` / `wrangler deploy` commands

**Astro site changes**
- `src/pages/wow.astro` — new page following `recs.astro`'s pattern (imports `BlogPost.astro` as layout, `title`/`description`/`pubDate` props). Static shell with a loading message, plus a `<script>` block that fetches `import.meta.env.PUBLIC_WOW_API_URL` and renders raid-grouped boss/difficulty badges into the page. Scoped `<style>` reusing existing CSS vars/conventions (bordered card blocks like `.rec-section`/`.post-card`, difficulty badges as small pill spans).
- `src/components/Header.astro` — add `<HeaderLink href="/wow">WoW</HeaderLink>` to `.internal-links`.
- `.env` (not committed) / note in README — `PUBLIC_WOW_API_URL` pointing at the deployed (or local `wrangler dev`, typically `http://localhost:8787`) Worker URL. Astro requires the `PUBLIC_` prefix for client-exposed env vars.

**Reminder:** update `CHANGELOG.md` before pushing, per repo convention (pre-push hook checks for this).

## Verification

1. `wow-api/`: `npm install`, create `.dev.vars` locally with real Battle.net credentials, `npx wrangler dev` — curl `http://localhost:8787/raids` and confirm it returns transformed JSON for Cageymage-Thrall-US (not a Blizzard error).
2. Astro site: set `PUBLIC_WOW_API_URL=http://localhost:8787` in local `.env`, `npm run dev`, visit `/wow`, confirm the page fetches and renders real kill data grouped by raid with difficulty badges, and that the new "WoW" tab appears and highlights correctly in the header.
3. Deploy the Worker (`npx wrangler deploy`) and set its real secrets via `wrangler secret put`; confirm CORS allows the Astro site's origin (adjust allowed-origin header to match the real production domain, not `*`, since this proxies Blizzard credentials indirectly).
4. Update `PUBLIC_WOW_API_URL` for the production Astro build to the deployed Worker's URL, `npm run build`, spot check the built `/wow` page still fetches correctly.
