# Changelog

All notable changes to the site are documented here.

## 2026-08-11
- `/wow` now groups raids by expansion (newest first) and sorts within each expansion by most recent boss kill
- Restyled difficulty badges with WoW-themed colors (LFR orange, Normal green, Heroic purple, Mythic glowing red) and fixed legacy 10/25-player difficulty labels
- Deduped raids Blizzard's API lists under multiple expansion labels (e.g. "Current Season")
- Fixed a bug where the page's styles never applied, since Astro's scoped CSS doesn't reach client-side-created DOM

## 2026-08-10
- Added `/wow` tab listing WoW raid boss kills by difficulty, backed by a live Blizzard API fetch
- Added `wow-api/`, a standalone Cloudflare Worker (separate from the main site) that proxies the Blizzard Character Encounters API
- Added GitHub Actions workflow to auto-deploy `wow-api` on push to main, with credentials stored as GitHub repo secrets

## 2026-08-08
- Wrote and finished Git Over Here
- Added mermaid support for blog posts

## 2026-08-06
- Finished part 3 of the Vapor Chamber

## 2026-08-05
- Wrote Part 2 and 3 of the Vapor Chamber

## 2026-08-05
- Wrote Part 2 of the Vapor Chamber
- refactored image references to specific directories across all blogs

## 2026-08-04
- New blog series: The Vapor Chamber
- Wrote Part 1 of the Vapor Chamber

## 2026-06-03

- Added static recommendations (`/recs`) tab
- Added CLAUDE.md with project context for Claude Code
- Added pre-push git hook to warn when changelog is not updated
