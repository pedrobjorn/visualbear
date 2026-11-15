# Tickets: Release 4.0 - unlisted case studies + the air-locked application path

- Part of: `specs/release-4.0/plan.md`
- All tickets are gated on R4-4's config existing before R4-5 runs the
  mirror; R4-1..R4-3 are independent of each other.

---

## R4-1 — Revert home cards to the Drive PDFs

- Size: S · Type: system (data)

### Context

`src/_data/work.json` was switched from Drive PDF hrefs to the new internal
case-study pages (commit `8ef9c9c` line of work; the Drive URLs are
recoverable with `git show d45c9ea~1:src/_data/work.json`). Release 4.0
defers that cutover (DR-R4-0001).

### Requirements

- Restore the three Drive PDF `href`s + `"target": "_blank"` from git
  history; card titles, subtitles, and thumbs stay as they are today.
- No other card/copy change.

### Acceptance criteria (agent-checkable)

- [ ] `work.json` hrefs are the three Drive URLs from git history
      (fashion, closet PDFs + the coupon/sports PDF
      `1oM2cJZVO4EVNk3uJeH1f2byxglC-hxlw` per history; sports gets
      `_blank` like the others).
- [ ] `grep -rn "fashion-rebrand\|digital-closet\|sports-ecommerce-redesign" build/index.html`
      finds NO card link to the unlisted pages (only incidental asset URLs).
- [ ] Cards render identically otherwise (thumb, title, subtitle).

### Out of scope

The later cutover (cards -> md pages) is a one-file change, deliberately
not in this release.

---

## R4-2 — Unlist the three md case-study pages

- Size: S · Type: system + copy (no visible copy change)

### Context

`fashion-rebrand`, `digital-closet`, `sports-ecommerce-redesign` stay in
the build ( demanded by the release brief) but lose every public
discovery surface. The teachr-gate work already added a `robots` noindex
block to `src/_layouts/base.nunjucks` - reuse it.

### Requirements

- Add `noindex` robots meta to the three shells (via the existing base
  block or the same mechanism the teachr shell uses).
- With R4-1 done, the pages have no inbound link from public pages.
- Verify they are absent from `sitemap.xml` (it is a 2020 static file -
  expected pass) and stay absent.
- The pages still cross-link each other via prev/next and related links -
  allowed: reachable only by knowing a page URL already.

### Acceptance criteria

- [ ] All three built pages contain `name="robots" content="noindex"`.
- [ ] `grep -rn "fashion-rebrand\|digital-closet\|sports-ecommerce-redesign" build/sitemap.xml src/sitemap.xml src/robots.txt` -> empty.
- [ ] Pages build and render at their URLs (200, visuals unchanged).
- [ ] No link to any of the three from `build/index.html`, nav, or footer.

---

## R4-3 — Unlist visuAI: drop the public footer workflow link

- Size: S · Type: system

### Context

The only public listing of `/workflow/` is the footer 🤖 link in
`src/_modules/molecules/footer/footer.nunjucks` (line ~34). The workflow
page itself moves to the air-locked mirror (R4-5).

### Requirements

- The public footer renders no link to `/workflow/` (remove the 🤖 anchor;
  keep the 🐻 anchor and everything else).
- The workflow page's own noindex meta from the teachr-gate work stays.

### Acceptance criteria

- [ ] `grep -rn "workflow" build/index.html` -> no href to it.
- [ ] `grep -c "workflow" build/*/index.html` public pages -> no footer link.
- [ ] Footer visual: only the bear emoji remains in that row (diff check).

---

## R4-4 — Secret path config + guard script

- Size: M · Type: system

### Context

The air-lock is the path (DR-R4-0004). The value must exist at build time,
never enter sitemap/robots/git history, and fail loudly when missing
(same discipline as `scripts/teachr-guard.sh`'s stale guard).

### Requirements

- `src/_data/private-path.json.example` (committed):
  `{"mirrorPath": "selected-works-XXXXXXXX"}` - placeholder only.
- `src/_data/private-path.json` (gitignored): the real value, generated
  once (innocuous word + 8 lowercase alphanumerics, generated with
  crypto.getRandomValues; no dictionary word alone).
- gulp reads the config when present; when the file is missing the build
  still succeeds but the mirror step (R4-5) is skipped with a loud console
  warning - public-only builds must keep working.
- `scripts/release-guard.sh` (evolve `teachr-guard.sh` or replace it):
  before any publish, asserts the mirror path appears NOWHERE in
  `sitemap.xml`, `robots.txt`, or any public-page HTML outside
  `build/<mirrorPath>/`, and that `build/<mirrorPath>/teachr/index.html` exists
  while `build/teachr/` does not. Exits non-zero on any failure.

### Acceptance criteria

- [ ] `.gitignore` covers `src/_data/private-path.json`.
- [ ] `git grep` across the whole repo for the real token: zero matches.
- [ ] Dev loop and plain `npm run build` behave exactly as today when the
      config file is absent.
- [ ] Guard exits non-zero on: token found outside the mirror, mirror
      missing, or public `<slug>` dirs still present.

---

## R4-5 — Mirror build step: copy to `build/<SECRET>/`, prune public secret pages

- Size: M · Type: system

### Context / approach (DR-R4-0003)

The mirror is a full copy of `build/` one level deeper, then the public
copies of the secret pages are pruned. Relative links keep resolving
because the directory structure is reproduced; root-absolute URLs already
point at the live public site (desired: the mirror links back to the main
site). Runs as a post-build script (Node or bash), wired after the gulp
build and before the guard (R4-4) in `scripts/build-protected.sh`'
s successor.

### Requirements

- Copy `build/` -> `build/<SECRET>/` (42 MB; ~84 MB total - open question
  in the plan notes a later dedup alternative).
- Add `name="robots" content="noindex"` to every `index.html` in the
  mirror (inject before `</head>`; idempotent).
- DELETE from the public root: `build/teachr/`, `build/teachr-agent/`,
  `build/workflow/` (their only home is the mirror).
- The mirror keeps its own copies of everything, including the three
  unlisted md case studies - recruiters get the full set.
- Idempotent: running twice produces the same tree; `npm run build` then
  `node scripts/release-mirror.js` is the only publish path documented.

### Acceptance criteria

- [ ] `build/<SECRET>/teachr/index.html`, `.../teachr-agent/index.html`,
      `.../workflow/index.html` all exist; `build/teachr/` etc. do not.
- [ ] From the mirrored teachr page, `../workflow/` resolves to
      `build/<SECRET>/workflow/index.html` on disk; mirrored images exist
      at `build/<SECRET>/images/...` so `../images/...` resolves.
- [ ] Every mirrored page carries noindex (count == number of index.html
      in the mirror).
- [ ] `grep -r "<SECRET>" build/sitemap.xml build/robots.txt` -> empty;
      no public page (outside the mirror) links into the mirror.
- [ ] Mirror root `index.html` renders; its `/styles/main.css`,
      `/scripts/main.js` root-absolute URLs match the public site's files.
- [ ] Re-running the whole build+mirror: byte-identical trees (except
      generated timestamps if any - none expected).

---

## R4-6 — Retire the password-gate leftovers

- Size: S · Type: system

### Context

The teachr password plan (A2, `plan-teachr-password.md`) is superseded:
teachr leaves the public build entirely, so a gate at the old URL protects
nothing worth gating (DR-R4-0002).

### Requirements

- Remove `src/teachr/index.php`, `scripts/teachr-guard.sh`,
  `scripts/build-protected.sh` (uncommitted files - delete, don't commit).
- Keep the `robots` noindex block in `base.nunjucks` (now used by R4-2/R4-3).
- `plan-teachr-password.md` stays as history with a superseded note at the
  top pointing to this spec.

### Acceptance criteria

- [ ] No `index.php` in `src/` or `build/`; guard/protected scripts gone.
- [ ] `build/teachr/` contains only the static mirror copy (no .php).
- [ ] The teachr plan file carries the superseded banner.

---

## R4-7 — Verification pass + publish-flow doc

- Size: M · Type: system

### Requirements

Run the full loop on the built output (Playwright or curl-level checks are
enough - no visual changes elsewhere):

- Public: cards -> Drive PDFs; case-study md pages + teachr + workflow
  unreachable by link; teachr/workflow 404 as URLs.
- Mirror: teachr and workflow render; a noindex mirror page's assets all
  load (no 404s in network log on one deep page, e.g. teachr).
- Secrets: repo grep + build grep for the token = only inside
  `build/<SECRET>/` paths (file trees), never in robots/sitemap/public HTML.
- Write the publish flow delta into `README.md` (or the doc that owns the
  publish flow, per plan.md item 4): build -> mirror -> guard -> FTP both
  zones up as one `build/`.

### Acceptance criteria

- [ ] All checks above recorded as evidence files in
      `specs/release-4.0/evidence/` (json + screenshots, mirror + public).
- [ ] Publish-flow doc updated and consistent with the guard script's
      exit conditions.
- [ ] A11y gate: untouched public pages stay as-is (no new axe findings);
      the mirrored teachr page keeps its existing zero-axe state.

---

## R4-8 — Dedicated 404 page in the hero's background layout

- Size: S · Type: UI + system (added 2026-11-04, built same day)

### Requirements

- `build/404.html` rendered on the shared centered `.cs-hero` layout with
  NO variant background; art direction v2 (Pedro, 2026-11-04): light-blue
  page ground ($vb-light), red ink (#d0181e - the eyebrow token; $vb-primary
  misses 4.5:1 on light grounds); copy per Pedro: "If you can't find what
  you're looking for, please contact hello@visualbear.com" (mailto link)
  - back-to-front-page link. Noindex, nofollow.
- Served as the web root's ErrorDocument: `src/.htaccess` ships to
  `build/.htaccess` (both zones) with `ErrorDocument 404 /404.html`;
  the copy task got an explicit dotfile glob.
- Bundled fix: the shared footer's contact h3s demoted to styled
  paragraphs - they are not sections and broke heading order on the
  404 (and pages whose only heading is an h1). Computed style matched,
  ~1px text sub-shift accepted, axe zero site-wide verified.

### Acceptance criteria

- [x] 404 renders the red cover hero at 1440 and 390 (screenshots in
      `evidence/404-*.png`, axe zero, zero console errors).
- [x] `build/404.html` + `build/.htaccess` exist in both zones; the
      guard still passes.
- [ ] LIVE only: confirm Porkbun honors the ErrorDocument (type a bogus
      URL after the first FTP publish) - the one check that cannot be
      done locally.

## Out of scope

The mirror's ErrorDocument resolves to the PUBLIC /404.html (root-absolute
by Apache convention) - a 404 inside the secret zone shows the public
404 page. Fine: it reveals nothing.

---

## R4-9 — Summary Portfolio card, top of the mirror gallery (mirror-only)

- Size: S · Type: UI + system (added + built 2026-11-04)

### Requirements

- A new gallery card "Summary Portfolio" appears as the FIRST card of the
  home gallery - ONLY in the air-locked mirror zone; the public home has
  no such card (verified + guard-asserted).
- Target: an EXISTING artifact - the summary-portfolio Drive PDF/doc
  (opens \_blank like the other PDF cards). Card data lives in
  `src/_data/mirror-card.json` (committed; Pedro fills the href).
- Mechanism: `scripts/release-mirror.js` injects the card (same markup
  shape as the built card molecule, marker `mirror-card:`) into
  `build/<mirrorPath>/index.html` after the merge-copy; the public
  `build/index.html` is untouched.
- Placeholder discipline: until href is set to a `https://drive.google.com/…`
  URL, the release guard FAILS - a build with an unfilled card cannot
  be uploaded. `img: ''` renders the plain black card plate (no thumb);
  Pedro adds a dedicated thumb in the JSON later.
- Copy: subtitle is AI-drafted with an `[ai]` marker - only Pedro rewrites
  and removes it.

### Acceptance criteria

- [x] Card order on the mirror home: Summary Portfolio, Fashion,
      Digital Closet, Sports - firstCardHref = the Drive URL, at both
      1440 and 390 (evidence `mirror-card-*.png`); axe zero; no console
      errors.
- [x] Public `build/index.html` carries no mirror-card markup.
- [x] Placeholder state: guard fails with an explicit fill-in
      instruction; filled state: guard passes, release ships.
- [ ] Pedro: fill the real Drive URL + rewrite the subtitle (remove
      [ai]), optionally add a thumb.
