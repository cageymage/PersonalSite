# Copilot Repository Instructions

This repository is a personal website + blog built with Astro.

## Project purpose
- A personal website that surfaces blog posts, recommendations, and help/documentation content.
- Primary content lives in `src/content/blog/`, with work-in-progress drafts in `src/content/blog-wip/` and docs in `src/content/help-docs/`.
- The site is intended to remain a static site with minimal client-side logic.

## Framework and tooling
- Astro v4 project
- Uses `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, and `@astrojs/check`
- Pages are defined in `src/pages/`
- Blog post content is stored as Markdown/MDX in `src/content/blog/`
- The blog collection schema is defined in `src/content/config.ts`
- Global styles are in `src/styles/global.css`

## Core project structure
- `src/pages/` — Astro routes
- `src/layouts/BlogPost.astro` — blog post page wrapper
- `src/components/` — shared site components like `Header`, `Footer`, `BaseHead`, and `FormattedDate`
- `src/content/blog/` — published blog posts
- `src/content/blog-wip/` — draft/in-progress posts
- `src/content/help-docs/` — documentation and markdown guidance
- `src/content.config.ts` — content collection schema and validation

## Content conventions
- Blog post frontmatter should include:
  - `title` (string)
  - `description` (string)
  - `pubDate` (date)
  - `updatedDate` (optional date)
  - `heroImage` (optional string)
- Use markdown or MDX for blog post body content.
- Keep content layout consistent with existing posts.
- For new blog posts, use `src/content/blog/` and let `src/pages/blog/[...slug].astro` render them via `BlogPost.astro`.

## Style and behavior
- Prefer simple, semantic HTML and accessible structure.
- Keep page-level styling minimal and consistent with existing CSS patterns.
- Avoid introducing complex client-side frameworks or heavy runtime JavaScript.
- Use Astro components for reusable page sections.
- Keep the site static-first.

## SEO and metadata
- Use `BaseHead` for title/description metadata on pages.
- Use canonical, OpenGraph, and other metadata only when appropriate and consistent with the site theme.

## When generating code or content
- Follow existing page and layout patterns.
- Prefer new pages under `src/pages/` and new content under `src/content/`.
- Do not invent backend APIs or server-side services; this project is a static site.
- Keep new additions aligned with a personal blog / recommendation site.

## Useful commands
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Notes for Copilot prompts
- This file provides repo-level context for Copilot.
- If more targeted generation is needed, add prompt files under `.github/prompts/`.
