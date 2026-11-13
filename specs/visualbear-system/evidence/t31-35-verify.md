# Evidence - tickets 31 + 35 (amendment pass 2026-11-13c, batch 2)

Method: static serve of the post-build tree, Python Playwright headless -
Chromium AND Firefox - at 390 and 1440 (contrast via element-clipped
pixel sampling: text luminance from the computed color, ground luminance
= median of the clip's non-text pixels). `npm run build` (release path)
green, all 5 release-guard checks OK; `npm test` green. Raw probe JSON:
session scratchpad (probe-batch2-final.out.json, probe-t35b.out.json).
Batch-1 regressions re-run on the same build: h1 visible = 1 and
id=contact = 1 on /visualbear/, /styleguide/, /about/, /workflow/.

## Ticket 31: case-study gallery alts + named wrapper links - PASS

Shipped: all 105 rendered case-page `<img>`s (art-ent 29, adhops 12,
steam-mobile 22, projectile-lynx 9, climate-clock 27, visualbear 6) got an
`alt`; the invalid `alt=` on the gallery wrapper `<a>` tags was removed -
each link takes its accessible name from its img's alt (the scanner's
aria-label/title/img-alt chain). Alts are [ai]-drafted from the real file
names + project context (e.g. "Art-Ent — Notice board"; the visualbear
gallery reuses its existing per-image names "Visualbear logo" etc.) -
Pedro's wording pass (Gate 7) owns the final strings; each file carries
an [ai] comment at its gallery. The headline molecule's logo mark is
decorative next to its h1 (alt="") and its hero image takes
`headline_img_alt` from the project data ([ai]-drafted for art-ent +
steam-mobile, the only two that set headline_img). The
src/visualbear/_styleguide_blocks duplication copies already carried
alts (the "Smiley face" placeholders are T32's gated asset call).

Probed (29 built pages, public + mirror, both engines, 322 imgs):
ZERO imgs without an alt attribute, ZERO links without an accessible
name (aria-label / text / img alt / title chain).

## Ticket 35: contrast stragglers - PASS, with one recorded deviation

Shipped + pixel-probed on the REAL rendered ground (both engines,
390 + 1440):

| element | before | shipped | pixel ratio after |
| --- | --- | --- | --- |
| /workflow/ .cs-eyebrow 15.36px | #E34A47, 3.64 best | #EE6E73 | 4.69-5.75 |
| .cs-metric-label (styleguide light ground) | #6E6E73, 4.47 | #66686D (T47 recipe, rule extended) | 5.21 |
| home + /about/ body links | #D73735, ~4.12 | #D0181E scoped to body.home-page/about-page (+nav/.foot/robot guards; hover/focus/active restated) | 4.83 |
| /workflow/ dark links (same token) | #E34A47, 3.8 | #EE6E73 | 5.43-5.50 |

RECORDED DEVIATION: the ticket named #EA544F for the eyebrow (T2's
shipped instance, "4.65 on the dark grounds"). Pixel probe on the
real ground - the strip/hero sit under the spotlight's strongest
alpha, which lightens the ground - measured #EA544F at only 3.87-4.14,
under the 4.5 bar. The lift therefore goes one palette step further to
#EE6E73 (visualbear-red lighten-2, the value this file's header already
documents as the eyebrow's 6.0:1 pick on flat #18181B) - still an
existing palette entry, no new color. Acceptance criterion (pixel
>= 4.5 on the real ground) is met for every flagged element.

RECORDED RESIDUAL (not fixed - Pedro's call): the tab strip's ACTIVE
label sits higher than the eyebrow, under the spotlight's brightest
~100px; #EE6E73 measures 4.19-4.33 there (was 3.47-3.58 at #EA544F).
Reaching 4.5 needs a further palette step toward pink (#F3989B ~5.8) -
a brand-look decision, left to Pedro. It was not in the sweep's flagged
list; the change here is the same-token lift, no regression.

Dark-ground check: no regressions - every dark-ground red text moved
UP (3.8 -> 5.4+); light grounds that already passed (/resume/ 4.97,
/styleguide/ 4.83) unchanged; hover plates on home/about keep the
shipped recipe (light ink on the red plate, same as the ticket-43
styleguide instance). Nav links stay white, footer links stay light-blue
(guards probed: computed colors unchanged).

ADDENDUM 2026-11-13 (regression fix, same ticket): the body.home-page
rule had re-inked the home HERO's links dark red (#D0181E) on the dark/
red hero ground - `body.home-page a` (0,1,2) outranked `.hero a`
(0,1,1). Fixed with a hero guard: `body.home-page .hero` and its links
are pure #fff again. Probed on public + mirror home, 390 + 1440:
hero h1 + all 3 hero links compute rgb(255,255,255), pixel ratio
5.37-5.41 on the real red ground (was ~1.9 for the red links). No
other link colors moved (#about links, nav, footer, /about/ body links
all re-probed unchanged).
