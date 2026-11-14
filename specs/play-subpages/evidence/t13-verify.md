# Ticket 13 verify - lightbox markup + styles (2026-11-14)

Changes (new module, nothing existing modified):

- New `src/_modules/molecules/lightbox/lightbox.nunjucks`: macro `content(spec)` rendering `<div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">` with `.lightbox-backdrop`, `<figure>` containing `img.lightbox-img` + `figcaption.lightbox-caption`, prev/next buttons (`class="btn vb-btn"`, text `<` / `>`, reusing the buttonslider arrow style) and a top-right close button with `aria-label="Close"`
- New `src/_modules/molecules/lightbox/lightbox.scss`: fixed overlay `inset: 0` on a dark `rgba($vb-dark, 0.92)` plate; `img` `max-height: 80vh; max-width: 90vw`; caption small (14px) bottom-center in `$vb-light`; all buttons `min 44x44` (they render 48x48 via `.vb-btn`); `.lightbox :focus-visible` red outline; `.lightbox[hidden] { display: none }` (normalize beats the UA `[hidden]` rule - same pattern as `.vb-panel[hidden]`); `prefers-reduced-motion` disables the backdrop transition
- `src/_styles/main.scss`: one added import line next to the other molecule imports

Agent-checkable acceptance (probe on the real /play/photography/ page, T14, with temp photos; screenshots in this dir):

- Dialog markup present in `build/play/photography/index.html` with `hidden` attribute, `role="dialog"`, `aria-modal="true"`, `aria-label="Photo viewer"`; computed `display: none` while hidden (`.lightbox[hidden]{display:none}` confirmed in compiled main.css)
- Force-shown: dialog `display: flex`; all three buttons measure 48x48 (>= 44x44); img computed `max-height: 720px` (80vh @900) / `max-width: 1296px` (90vw @1440)
- Caption `rgb(230,242,255)` 14px on the `rgba(24,24,27,0.92)` plate: computed contrast 15.6:1 (>= 4.5:1)
- Keyboard Tab onto a lightbox button: `:focus-visible` matches, outline `solid 2px rgb(215,55,53)`
- Gates: sass compiles, `npm run build` exit 0 + all guard checks OK, `npm test` 5/5 suites pass, `npm run lint` 0 errors (9 pre-existing warnings), prettier clean on `src/_styles/**/*.scss`

Out of scope per ticket: controller behavior (T15); applying the dialog anywhere else.
