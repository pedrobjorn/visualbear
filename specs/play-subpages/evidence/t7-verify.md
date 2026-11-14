# Ticket 7 verify - seed post data + top card (2026-11-14)

Changes:

- New `src/_data/pages/blog-hello-world.md`: front-matter hero per AUTHORING.md (`eyebrow: "Blog"`, `title: "Hello World"`, `summary`, `details: "14 Nov 2026"` - the date sits in the hero details line, the bounded-vocabulary slot for dates) + one short `##` section body carrying the `[ai]` marker (visuaibear-core #7; production strips the chip and logs the AI-ATTRIBUTED warning, as designed in DR-0006 - copy is Pedro's to rewrite)
- New `src/_data/project_blog_hello_world.json`: `prevhref {"link": "../", "text": "Blog"}`, `nexthref {"link": "../disabled", "text": ""}`. DEVIATION from the ticket text, which said `"../../"`: from `/play/blog/hello-world/` (depth 3, trailing slash) `../../` resolves to `/play/`, not `/play/blog/`; the acceptance criteria and manual test both require "< Blog" to go back to `/play/blog/`, which needs `../`. Flagging for Pedro.
- `src/_data/blog.json`: prepended `{ "title": "Hello World", "subtitle": "14 Nov 2026", "href": "hello-world/", "img": "../../images/work/thumbs/gallery_thumb_prettyugly.jpg" }` on top (newest first); title/date identical to the md hero; img = reused shipped thumb (H2 cover asset pending - same ASSUMPTION pattern as T1/T2, one-line swap when Pedro's cover arrives)

Agent-checkable acceptance:

- `npm run build` (release) -> exit 0, all guard checks OK; the only new `[ai]` warning is hello-world (1 block) - expected
- `build/play/blog/hello-world/index.html` now renders (T6's plumber error is gone): exactly one `<h1>` ("Hello World"), hero details "14 Nov 2026", body section "Why a blog" present, bottom nav has the prev `<a href="../" class="btn vb-btn-full left-align">&lt; Blog</a>` inside the `nav[aria-label="Previous / next"]` landmark and ZERO next arrows (`../disabled` renders none)
- `build/play/blog/index.html` card order: "Hello World" (href `hello-world/`, subtitle "14 Nov 2026") first, then "First blog post" (`blog2/`), "Second blog posts" (`blog1/`) - array order = display order, top card matches the post hero title+date
- New-post flow verified once (this ticket IS the flow): md + project json + blog.json prepend -> rebuild -> card appears on top
- Live on `npm run serve`: `GET /play/blog/hello-world/` -> 200 (h1 "Hello World", prev button present); the prev `../` target `GET /play/blog/` -> 200; `GET /play/blog/` first card = Hello World
- `npm test` -> all 4 suites PASS/OK

Gates: `format:check` -> 12 pre-existing warnings only; touched files prettier-clean (md under `src/_data/pages/` is outside the prettier glob per AUTHORING.md).

A11y: structural checks done here (one h1, buttonslider nav landmark intact); the full axe probe + visuaibear-review gate runs in T16.
