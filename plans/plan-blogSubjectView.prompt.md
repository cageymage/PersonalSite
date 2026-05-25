## Plan: Blog homepage grouped by subject

TL;DR: Update `src/pages/blog/index.astro` to render the blog list grouped by a new `subject` frontmatter field by default, and add an alternate same-page view sorted by `updatedDate`. Update `src/content/config.ts` to support optional `subject`, and annotate existing blog posts so SEB parts 1-5 share a common subject heading.

**Steps**
1. Update the blog content schema in `src/content.config.ts` to add `subject: z.string().optional()`.
2. Add `subject` frontmatter to blog files:
   - `seb-pt1.md` through `seb-pt5.md` should share `subject: 'Software Engineering Basics'`.
   - Add a `subject` for the remaining posts or leave unspecified and fallback to `Other` or `General`.
3. Modify `src/pages/blog/index.astro`:
   - Read all blog posts from `getCollection('blog')`.
   - Determine the current view mode from the page URL search param, e.g. `?view=updated`.
   - Default to subject grouping if no view is specified.
   - For subject view, group posts by `post.data.subject ?? 'Other'`, then render each group with a heading.
   - For updated-date view, render a single list sorted by `updatedDate` descending, including the subject label for each post.
   - Add a simple navigation/toggle UI at the top of the page with links or buttons for `Subject` and `Updated` views.
4. Adjust page markup and styling in `src/pages/blog/index.astro` for grouped headings and a cleaner list layout.
5. Test locally by visiting `/blog`, `/blog?view=subject`, and `/blog?view=updated`.

**Verification**
1. Confirm `/blog` shows posts grouped by subject headings.
2. Confirm `SEB Part I` through `SEB Part V` appear under one `Software Engineering Basics` section.
3. Confirm `/blog?view=updated` shows posts sorted by latest update date.
4. Confirm no content schema validation or build errors after adding `subject` metadata.

**Decisions**
- Use a dedicated `subject` frontmatter field, since current blog files do not include one.
- Implement alternate sorting via a same-page query parameter, keeping the default subject view.
- Fallback group name will be `Other` or similar for posts without an explicit subject.

**Further Considerations**
1. If you want, I can also update the individual blog list item UI to show the subject label in the updated-date view.
2. If you want a permanent “Latest updated” landing page instead of a query switch, I can revise the plan accordingly.
