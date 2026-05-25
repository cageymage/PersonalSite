# Blog homepage grouped by subject

This prompt is for updating the Astro blog listing page to support subject grouping and an alternate updated-date view.

## Goal
Implement a blog homepage view that:
- groups posts by a new optional `subject` frontmatter field,
- defaults to the grouped subject view,
- supports an alternate `/blog?view=updated` mode sorted by latest `updatedDate`.

## Repo context
- Astro v4 static site
- Blog content is in `src/content/blog/`
- Blog page route is `src/pages/blog/index.astro`
- Blog schema lives in `src/content.config.ts`
- Existing layout uses `src/layouts/BlogPost.astro`

## Implementation details
1. Update `src/content.config.ts` to make `subject` an optional string.
2. Add `subject` frontmatter to blog posts where appropriate, e.g. set `seb-pt1.md` through `seb-pt5.md` to `Software Engineering Basics`.
3. In `src/pages/blog/index.astro`:
   - load all blog posts from `getCollection('blog')`
   - determine current view mode from `Astro.url.searchParams.get('view')`
   - default to subject grouping when no view is specified
   - group posts by `post.data.subject ?? 'Other'` for the subject view
   - sort posts by `updatedDate` descending for the updated view
   - render a simple toggle UI for `Subject` and `Updated` views
4. Keep styling minimal and consistent with the existing blog list design.

## Notes
- Preserve the existing static-only site approach.
- Prefer simple semantic HTML and accessible layout.
- Don’t introduce client-side frameworks beyond the current Astro setup.
