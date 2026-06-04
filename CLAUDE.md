# PersonalSite — Claude Code Context

Personal developer blog/portfolio built with Astro (static site, no backend).

## Stack

- **Framework**: Astro v6 with TypeScript (strict mode)
- **Content**: Astro Content Collections (Markdown/MDX) via `src/content.config.mjs`
- **Styling**: Global CSS only — `src/styles/global.css`. No Tailwind.
- **Integrations**: MDX, Sitemap, RSS feed (`@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`)
- **Type checking**: `@astrojs/check` (runs as part of `npm run build`)

## Project Structure

```
src/
  pages/          — Astro routes (each file = a page)
  components/     — Shared components (Header, Footer, BaseHead, FormattedDate, HeaderLink)
  layouts/        — Page layouts (BlogPost.astro)
  content/
    blog/         — Published blog posts (.md / .mdx)
    blog-wip/     — Draft posts, not surfaced to the site
    help-docs/    — Markdown documentation
  content.config.mjs  — Content collection schema (Zod)
  consts.ts       — SITE_TITLE, SITE_DESCRIPTION
  lib/
    blog-utils.ts — normalizeSubject(), slugifySubject()
  styles/
    global.css    — All site styles
```

## Pages / Routes

| Route | File |
|---|---|
| `/` | `src/pages/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/[slug]` | `src/pages/blog/[slug].astro` |
| `/blog/subject/[subject]` | `src/pages/blog/subject/[subject].astro` |
| `/recs` | `src/pages/recs.astro` |
| `/rss.xml` | `src/pages/rss.xml.js` |

## Blog Post Frontmatter (src/content.config.mjs schema)

```yaml
title: string          # required
description: string    # required
pubDate: date          # required
updatedDate: date      # optional
subject: string        # optional — categorizes post; normalized by normalizeSubject()
order: number          # optional — for ordering posts within a series
heroImage: string      # optional — path to hero image
```

- Published posts go in `src/content/blog/`
- Draft posts go in `src/content/blog-wip/` (excluded from listings)
- Subject slugs are lowercased + hyphenated via `slugifySubject()`

## Dev Commands

```bash
npm run dev      # Start local dev server
npm run build    # Type-check (astro check) + production build
npm run preview  # Preview the production build locally
```

## Conventions

- Static-first: no backend APIs, no server-side services
- Prefer simple semantic HTML; avoid heavy client-side JS
- Use `BaseHead` component for page metadata (title, description, OG tags)
- New pages go under `src/pages/`, new content under `src/content/`
- Keep styling consistent with existing `global.css` patterns

## Changelog

`CHANGELOG.md` lives at the project root. Update it before pushing to origin.
A pre-push git hook (`git/hooks/pre-push`) will warn if it hasn't been touched.
