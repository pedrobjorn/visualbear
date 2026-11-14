# Ticket 6 verify - blog post shell `src/play/blog/hello-world/index.nunjucks` (2026-11-14)

Change: new shell `src/play/blog/hello-world/index.nunjucks` - extends `_layouts/work.nunjucks`, `baseUrl = '../../../'` (depth 3), wrappers copied from `src/teachr/index.nunjucks` (`article.section.section-top-padding.case-study` > `section.gallery-container` > `div.container` > `div.document-text.text-box`), content = `mdhero` + `mdpage` on `site.data.pages['blog-hello-world']`, then `buttonslider.content({nexthref: site.data.project_blog_hello_world.nexthref, prevhref: site.data.project_blog_hello_world.prevhref})`. Top comment states the copy-per-post authoring step (new dir per slug + `blog-<slug>.md` + `project_blog_<slug>.json` + prepend to `blog.json`).

diff vs `src/teachr/index.nunjucks`: identical structure; only intended deltas - teachr-only blocks dropped (title/description/robots noindex/bodyattrs `cs-teal-page` - a public post needs none), slug swapped to `blog-hello-world` / `project_blog_hello_world`, baseUrl depth-corrected, authoring comment added.

Agent-checkable acceptance:

- Shell exists at `src/play/blog/hello-world/index.nunjucks`; diff review above: same wrappers, same filters, `baseUrl = '../../../'`
- `npm run build` (release) with the shell present, T7 data NOT yet landed -> exit 0, all release-guard checks OK. Note: the nunjucks task logs one template error for this page (`mdhero` on the missing `blog-hello-world` key; plumber keeps the build green) and emits no `build/play/blog/hello-world/index.html` yet - expected, the page renders once T7's md/json land (verified there)
- `npm test` -> all 4 suites PASS/OK

Gates: `format:check` -> 12 pre-existing warnings only; touched files prettier-clean. No `markdown-render.js` change (out of scope).

Open items: real render verification happens in T7 when `src/_data/pages/blog-hello-world.md` + `src/_data/project_blog_hello_world.json` land.
