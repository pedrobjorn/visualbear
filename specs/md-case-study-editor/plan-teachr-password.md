# Plan: Password-protect the Teachr pages

> **SUPERSEDED 2026-11-02 by `../release-4.0/` (DR-R4-0002):** teachr,
> teachr-agent, and workflow leave the public build entirely and live
> only under the air-locked application path ("information is the
> password"). The A2 PHP gate below was built and tested but never
> deployed; its repo artifacts (`src/teachr/index.php`,
> `scripts/teachr-guard.sh`, `scripts/build-protected.sh`) were removed
> in R4-6. Kept as history.

- Date: 2026-11-01
- Status: A2 CHOSEN (Pedro, 2026-11-01: custom HTML gate) — TP-3a built
  - tested in an emulated Porkbun environment; TP-1 recon + TP-3b
    server-side steps remain (Pedro, via FTP)
- Scope: `/teachr/` (+ `/teachr-agent/` — open question TP-1)
- Security bar (Pedro, 2026-11-01): "doesn't have to be super secure"
  — the goal is keeping the page non-public (clients, recruiters,
  crawl), NOT resisting a determined attacker. Stated honestly: no
  static-hosting option below resists an offline brute-force of a weak
  password.

## Hosting facts (Pedro, 2026-11-01)

- **Porkbun shared hosting**: Linux + Apache, PHP supported, deploy =
  FTP/SFTP upload of `build/`. No SSH, no Node, no git deploy, no
  serverless. HTTPS via Porkbun's SSL.
- Publish flow: Pedro copies `build/` up (plan.md item 4).
- A home directory exists ABOVE the web root (`public_html`-equivalent)
  — files there are web-inaccessible: the secret's home.

## Problem / opportunity

Teachr (and Teachr Agent) are public portfolio pages today. Pedro wants
them behind a password — client-identifiable work that should not be
crawlable or openly linkable.

## Hard constraints

1. **The site is static.** `build/` is plain files; publish is Pedro's
   own flow (not yet defined — `plan.md` item 4). There is no app
   server in this repo, no CI, no deploy config.
2. **The secret must not live in the repo, the build output, or git
   history.** (Pedro: "obviously we can't store it on the localhost" —
   interpreted as: not in client-side code or any shipped artifact. A
   password check in shipped JS fails this even when only a hash ships:
   a weak password is brute-forced against a shipped verifier in
   seconds.)
3. **Toolchain Node 10** (`.nvmrc`) — no new dev dependencies inside the
   gulp pipeline. A protection step may live OUTSIDE the pipeline
   (Pedro's machine / CI on modern Node) as a post-build step.
4. Never commit the password or its hash; generation commands should
   keep the plaintext out of shell history where practical.

## Options explored (tech → lo-fi, ranked for Porkbun)

### A1. Apache Basic Auth via `.htaccess` + htpasswd — TOP CANDIDATE

- Porkbun shared hosting is Apache; if `.htaccess` `AuthType Basic` is
  allowed (VERIFY at TP-2 — some shared hosts restrict it), this is ten
  minutes of work with zero code.
- The secret is a salted bcrypt hash file ON THE SERVER, outside the
  web root (constraint 2 holds trivially). Covers EVERYTHING under the
  path: HTML, images, css — no asset leakage.
- The `.htaccess` itself carries NO secret (just `AuthName` + the
  `AuthUserFile` path), so it can live in the repo at
  `src/teachr/.htaccess` and ship with the build. The htpasswd file is
  generated locally (`htpasswd -B`, bcrypt) and uploaded once — never
  committed.
- Cons: the native browser prompt (ugly, unbranded); `AuthUserFile`
  needs the ABSOLUTE server path (discover via a temporary
  `echo getcwd()` PHP file or Porkbun's panel — TP-2 step 1).
- If Porkbun rejects the auth directives → fall back to A2.

### A2. PHP session gate — fallback, best UX on Porkbun

- Porkbun runs PHP. `teachr/index.php` is the ONLY file under the web
  root for that path: it checks `$_SESSION`, shows a small password
  form on POST, verifies against a **bcrypt hash in a file stored ABOVE
  the web root** (`password_verify`), then serves the real page with
  `readfile()` from a copy OUTSIDE the web root.
- Key detail: the real HTML must NOT sit at `/teachr/index.html` (the
  URL bypasses PHP entirely) — the publish flow uploads it to
  `~/teachr-page/index.html` (above the web root) and the gate
  readfiles it. Unauthenticated visitors get the form; the page's
  actual bytes never live under the web root.
- Server-side verification: NO shipped verifier, NO offline
  brute-force — strictly stronger than StatiCrypt at the same lo-fi
  effort. Rate-limiting: a sleep on failure (shared-hosting honest).
- Assets (css/images) stay publicly fetchable — accepted at the stated
  bar; a `.htaccess` deny on the images dir can close it if A1's
  directives turn out to work partially.
- Cons: session config on shared hosting (cookie params), the publish
  flow gains a "upload the page copy outside the root" step; PHP file
  in the repo is fine (code, no secret).

### B. StatiCrypt (static encryption) — no server features needed

- AES-256-GCM encrypts the built HTML; the prompt page decrypts
  in-browser. The password never exists anywhere on the server or in
  the repo (ciphertext only).
- Now ranked BELOW A1/A2 on Porkbun: its one structural weakness — the
  public ciphertext (offline brute-force of weak passwords) — is
  unnecessary when the host runs PHP/Apache. Still the choice if
  `.htaccess` AND PHP both disappoint, or for a zero-server move later.
- Cons: offline brute-force (≥ 4 random words rule); assets stay
  public; JS required; encrypt step outside the Node-10 pipeline.

### C. Cloudflare Access — "something hosted", the upgrade path

- Real auth at the edge (email one-time PIN), free ≤ 50 users. Porkbun
  is the registrar; DNS can be pointed at Cloudflare without moving
  hosting. Zero code, zero server config.
- Cons: moving DNS to a third party; a login wall with an email
  round-trip for every new visitor. Worth it only if the audience
  grows or password fatigue sets in.

### D/E/F — unchanged verdicts

- D (managed-host protection): N/A on Porkbun. E (client-side hash
  gate): rejected — shipped verifier. F (serverless gate): N/A on
  Porkbun, dominated by A2 anyway.

## Decision (Pedro, 2026-11-01)

**A2 — the PHP gate with a CUSTOM HTML gate page** ("we want a custom
html page, not a browser page"). A1's browser dialog is out; the map
below is the build plan. A1/B/C stay documented as fallbacks.

## A2 build map

### Architecture

    BROWSER                PORKBUN (Apache + PHP)                HOME DIR (above web root)
    ───────                ──────────────────────                ─────────────────────────
    GET /teachr/  ───────▶ public_html/teachr/index.php
                            │ session? ──no──▶ GATE PAGE (custom HTML, noindex)
                            │                    │ POST pw
                            │                    ▼
                            │               password_verify(pw, ~/teachr-page/.phash)
                            │                 │ ok: session_regenerate_id, $_SESSION flag
                            │ ──yes──────────┐▼
                            ▼                readfile(~/teachr-page/index.html)
    page renders           ◀── the real page's bytes — served from OUTSIDE the web root

    Assets (css/images/fonts): still public static files at their normal
    URLs — relative paths from /teachr/ resolve unchanged (the PHP sits
    at the same URL path as the old index.html). Accepted at the stated
    security bar; the HTML's BYTES are what stays unreachable.

### Files

| Where          | File                       | In repo?                                                                                                                     | Secret?           |
| -------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| web root       | `teachr/index.php`         | yes (src/teachr/index.php — copied by the pipeline's catch-all, verified: copy task ships any non-`_`, non-`.nunjucks` file) | NO (code only)    |
| web root       | `teachr/index.html`        | the compiled page — **must NOT be uploaded** (bypass: direct URL skips PHP)                                                  | n/a               |
| above web root | `~/teachr-page/index.html` | no — the publish flow uploads it                                                                                             | no                |
| above web root | `~/teachr-page/.phash`     | no — generated once, uploaded once                                                                                           | YES (bcrypt hash) |

### The gate page (custom HTML — the reason A2 won)

- Self-contained: inline `<style>`, no external css/js dependency.
- Brand: #18181B ground, light-blue #E6F2FF ink, Nunito; the bear mark
  or the "visualbear" wordmark centered; the form in a centered card
  (#252528 plate, 12px radius — the case-study card look).
- States: default (autofocused password field + Enter button),
  error ("Wrong password." — quiet red), success (redirect-free: the
  page renders after the POST).
- A11y: real `<label>`, focus states visible, axe zero on the gate.
- `<meta name="robots" content="noindex">`; `<title>Teachr — protected`.
- Session cookie: httponly + samesite Lax + secure (Porkbun HTTPS);
  default lifetime (browser session) — a "stay signed in" checkbox is a
  later nice-to-have, not in this build.

### Publish flow delta (the one ongoing cost)

1. `npm run build` as today.
2. Run the guard script (TP-3c): moves `build/teachr/index.html` to
   `~/staging/teachr-page/index.html` — after it, the FTP upload of
   `build/` physically CANNOT ship the bypass file.
3. FTP `build/` → web root; FTP the staged file → `~/teachr-page/`.
4. One-time: upload `.phash` (generation below).

`scripts/teachr-guard.sh` (bash, ~10 lines — TP-3c): stage + clear
`build/teachr/index.html`; exits non-zero if `build/teachr/` was not
rebuilt (stale guard).

### Hash generation (no local PHP assumed)

`pip3 install bcrypt` then:

    python3 -c "import bcrypt; print(bcrypt.hashpw(b'<password>', bcrypt.gensalt()).decode())" > .phash

`password_verify` accepts `$2b$` hashes. The plaintext never touches
the repo, the build, or the server's disk (the command lives in shell
history — run with a space-prefixed command if HISTCONTROL is set, or
generate interactively).

### Edge cases (each gets a check in TP-5)

- **Direct `/teachr/index.html`** → 404 (the file is never uploaded).
- **`~/teachr-page/index.html` missing** (publish step forgotten) →
  the gate shows an explicit "page not deployed" error, never a blank
  page or a PHP warning.
- **Wrong password** → error state + `sleep(1)` (shared-hosting honest
  throttle).
- **Session expiry** → gate renders again (no half-state).
- **teachr-agent** (if in scope): same pattern, `~/teachr-page/
agent.html`, the SAME session flag — one password unlocks both.
- **noindex**: the teachr shell gains the robots meta (it is already
  absent from `sitemap.xml` — verified 2026-11-01).

## Breakdown (A2 chosen)

- [ ] **TP-1 — Server recon (blocks the build; ~5 min via FTP)** —
      (a) the absolute home + web-root paths (temp file
      `<?php echo __DIR__;` → browse → DELETE); (b) PHP version (same temp
      file, `phpversion()`); (c) readfile above the web root works (temp
      file: `readfile(dirname(__DIR__) . '/test.txt')` after FTP-ing a
      test.txt up one level → DELETE after); (d) scope: `/teachr/` only or
  - `/teachr-agent/`; (e) password owner + storage (password manager).
    Write DR-0015.
- [x] **TP-3a — Gate build (repo side) — DONE 2026-11-01, tested** —
      `src/teachr/index.php`: the FULL gate (session flag, `password_verify`
      against `~/teachr-page/.phash`, the custom brand gate page, error
      state + `sleep(1)`, `session_regenerate_id(true)` on success, cookie
      params httponly/samesite/secure, an explicit "page not deployed" 503
      if the above-root copy is missing); the teachr shell carries the
      robots noindex meta (new `robots` block in `base.nunjucks`);
      `scripts/teachr-guard.sh` + a build wrapper
      `scripts/build-protected.sh` — `npm run build` now settles the gulp
      watch, stops it, and runs the guard automatically.
      **TESTED end-to-end** (PHP 8.2 emulated via php-wasm, real HTTP
      server + real build artifacts, Porkbun layout replicated — evidence:
      `evidence/tp3-browser-verify.json`, `tp3-gate-*.png`,
      `tp3-teachr-authed-1440.png`): gate renders (wordmark / label / form
      / noindex), wrong password → error + 1130ms delay, correct → 302 →
      the page BYTE-IDENTICAL to the build with all assets loading, reload
      keeps the session, direct `/teachr/index.html` → 404, missing
      above-root copy → clean 503. axe ZERO on the gate and the authed
      page (two contrast fixes found + fixed: error ink + wordmark span →
      #ee6e73, the dark-ground red). Secret grep over repo + build: empty.
      The browser test caught a REAL bug: a `secure` cookie over plain
      http is silently dropped — the gate derives `secure` from
      HTTPS / X-Forwarded-Proto / port 443.
- [ ] **TP-3b — Server side (Pedro, one-time)** — generate `.phash`
      (bcrypt command in the A2 map), FTP it + the staged page copy to
      `~/teachr-page/`, FTP the build (the guard has cleared the bypass
      file).
- [ ] **TP-5 — Verification pass** — gate renders (default state,
      capture); wrong password → error state + delay (capture); right
      password → the page renders PIXEL-IDENTICAL to today's `/teachr/`
      (capture diff); direct `/teachr/index.html` → 404; missing
      above-root copy → explicit error; axe zero on the gate; other pages
      untouched; secret grep over repo + build = empty.

## Acceptance criteria (the plan, agent-checkable)

- [ ] `grep -rn` the repo AND `build/` for the password and its hash:
      nothing (the `.phash` file lives only on the server, above the web
      root)
- [ ] `/teachr/` (and scope) → the gate without the password; → the
      normal page with it; every other page unaffected (200, visuals
      unchanged)
- [ ] `/teachr/` stays out of `sitemap.xml`; the gate carries
      `noindex`
- [ ] DR-0015 written: chosen option (A2), TP-1 findings, where the
      secret lives (server file + Pedro's password manager — never the
      repo)

## Non-goals

- Real multi-user auth, sessions, rotation tooling.
- Protecting against a determined attacker (offline brute-force of a
  weak password; traffic analysis; asset metadata).
- Hiding teachr's IMAGES/ASSETS from a determined fetcher (option B
  leaks URLs; option A covers them — noted per option).

## Evidence

- User request (Pedro, 2026-11-01): "protect Teachr behind a
  password… doesn't have to be super secure, but obviously we can't
  store it on the localhost" — ASSUMPTION on scope (teachr-agent?) and
  purpose (client review vs permanent), needs validation at TP-1.
- Repo audit 2026-11-01: no deploy config, no CI, no netlify/vercel
  files; `.nvmrc` = Node 10; publish flow undefined (plan.md item 4).
- StatiCrypt facts: robinmoisson/staticrypt — AES-256-GCM in-browser
  decryption, CLI encrypt step, v3 config; Node ≥ modern for the CLI
  (constraint 3 workaround: run outside the gulp pipeline).
