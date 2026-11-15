# Plan: Release 4.0 - unlisted case studies + the air-locked application path

- Date: 2026-11-02
- Status: ready (spec; not building)
- Evidence: Pedro's release brief (2026-11-02, chat) - "cards still point to the
  drive pdf files for now", "keep these pages in the build, just unlisted and
  unlinked", "an isolated air-locked url path just for job applications",
  "information will be the password", "unlist visuai and teachr".
  Scope answers (same chat): secret path hosts the teachr/workflow pages
  (they leave the public build); slug = innocuous word + unguessable suffix.

## Problem / opportunity

Release 4.0 ships the rebuilt md-driven case-study system, but two contents
are not ready for public prime time:

1. The three new md case-study pages (fashion-rebrand, digital-closet,
   sports-ecommerce-redesign) exist and are built, but the home-page cards
   still need to serve the Drive PDFs Pedro already shares with clients.
2. Client-identifiable work (teachr, teachr-agent) and the visuAI workflow
   page must not be publicly discoverable - but recruiters on job
   applications need to see them.

## Goal

One publishable `build/` where: the public side is unchanged in structure
(cards -> Drive PDFs, three md pages built but unlinked), and everything
private lives under one unguessable URL path that Pedro can paste into a
job application. Measured by: a stranger with the public URL can reach
neither teachr, teachr-agent, workflow nor the unlisted case studies by
following any link, sitemap, or robots hint.

## Approach

Two zones in one build, produced by a post-build script (extends the
existing `scripts/teachr-guard.sh` pattern):

    PUBLIC SITE (build/ root)            AIR-LOCKED MIRROR (build/<SECRET>/)
    ---------------------------------    -----------------------------------
    index (cards -> Drive PDFs)          full copy of the same site
    about, resume, play, blog, ...       + teachr/, teachr-agent/, workflow/
    fashion-rebrand, digital-closet,     (the pages REMOVED from the root)
    sports-ecommerce-redesign
      (built, unlinked, noindex)         every mirrored page: noindex
    NO teachr, teachr-agent, workflow    never in sitemap.xml, robots.txt,
    (moved to the mirror, root = 404)    nav, footer (public side)

Key properties:

- The mirror is a full copy of `build/` one level deeper. Because built
  pages are ~99% relative URLs (`../images/...`, `../teachr/`), the same
  structure mirrored under a directory keeps every relative link resolving
  - inside the mirror. The few root-absolute URLs (`/`, `/#work`,
    `/styles/main.css`, `/scripts/main.js`) point at the live public site -
    which is desired: the mirror links back to visualbear.com.
- Access control = the path is unguessable and referenced NOWHERE:
  no sitemap entry, no robots.txt line (robots.txt DISALLOW would advertise
  the path), no link on the public side, not committed to any public repo.
  Information is the password.
- `/teachr/`, `/teachr-agent/`, `/workflow/` return 404 on the public
  site; they exist only under `/<SECRET>/`. This supersedes the teachr
  password gate (A2) - see DR-R4-0002.

## Breakdown

- [ ] R4-1 — Revert home cards to the Drive PDFs (S)
- [ ] R4-2 — Unlist the three md case-study pages (S)
- [ ] R4-3 — Unlist visuAI: drop the footer workflow link publicly (S)
- [ ] R4-4 — Secret path config + guard script (M)
- [ ] R4-5 — Mirror build step: copy to `build/<SECRET>/`, prune public secret pages (M)
- [ ] R4-6 — Retire the password-gate leftovers (S)
- [ ] R4-7 — Verification pass + publish-flow doc (M)

Tickets: `tickets.md` · Decision records: DR-R4-0001..0004.

## Non-goals

- Real authentication (passwords, sessions, Cloudflare Access) - the
  unguessable path is the agreed security bar ("information is the
  password"); a URL cannot be brute-forced like a weak password. The
  teachr password plan's A2 gate is superseded, not extended.
- Hiding from a determined attacker who can log traffic or guess an
  8-char random suffix - accepted residual risk, same bar as before.
- Changing any visual design or copy. This release is purely routing,
  listing, and build plumbing.
- Custom 404 page for the retired public `/teachr/` URLs.

## Decision records

- DR-R4-0001 - Cards keep the Drive PDFs on release 4.0; the md-page cutover
  is a later, one-line change (work.json only). The md pages stay in the
  build, unlisted and unlinked.
- DR-R4-0002 - The air-lock supersedes the teachr password gate (A2).
- DR-R4-0003 - Full-site mirror over the one-page/PDF drop-in.
- DR-R4-0004 - Slug = innocuous word + random suffix; path hygiene rules.

## Open questions

| Question                                                                                                                                                                         | Owner | Blocks build?                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------ |
| Mirror doubles the upload (~42 MB -> ~84 MB FTP). Alternative later: exclude `/images` from the mirror and let mirrored pages load public assets from the site root              | Pedro | no (proceed with full copy)    |
| Exact slug phrase: proposal `selected-works-<8char>` vs `portfolio-summary-<8char>` - Pedro picks; the token file is gitignored so the value can be regenerated/renamed any time | Pedro | no (R4-4 reads it from config) |
| Should the mirror's home page carry any special framing for recruiters (intro line, contact CTA)? First cut: byte-identical site mirror, zero new design                         | Pedro | no                             |
