"""Box audit — tickets 30/31/32, DR-0009 amendments.

Measures the bleeding-box system on the content pages and flags:

  - horizontal overflow: document.scrollWidth != innerWidth
  - any box component crossing the viewport or sitting closer than
    BOX_MARGIN (8px) to the viewport edge
  - box edges off the bleed edge (text edge - $cs-indent), +/- 2px,
    except the documented exceptions (metric chips -16 rhythm,
    panel-width frames, display graphics)
  - chip/annotation dot geometry: dot on the text edge (+/- 1px), and
    annotation dots never outside their enclosing box
  - resume: name/contact/download lists unmarked (rendered-pseudo check:
    display 'none' = no dot), content lists' dot on the text edge,
    text +8px, list top gap >= 8px

Unlike edge-audit.py (text elements only), this measures BOXES, tables
and document overflow — the class of bug that shipped twice.

Usage:
    python3 specs/md-case-study-editor/tools/box-audit.py [baseUrl] [--json OUT]

Requires the dev server (default http://localhost:3000) and Playwright:
    pip3 install playwright && playwright install chromium
"""
import json
import sys

from playwright.sync_api import sync_playwright

BOX_MARGIN = 8      # px a box must keep inside the viewport
BLEED_TOLERANCE = 2 # px
DOT_TOLERANCE = 1   # px
CS_INDENT = 28      # $cs-indent

PAGES = [
    "workflow", "teachr", "teachr-agent", "digital-closet",
    "fashion-rebrand", "sports-ecommerce-redesign", "resume",
]
VIEWPORTS = [1440, 1024, 768, 780, 390]

# boxes exempt from the bleed-edge check (DR-0009 documented exceptions:
# display elements and the full-bleed tier)
EXEMPT_BLEED = ("cs-metric", "cs-frame", "cs-showcase", "cs-wide",
                "cs-hero", "cs-panel", "cs-annotation", "cs-quote",
                "cs-metrics", "cs-table")
# the full-bleed tier touches the viewport edge BY DESIGN — exempt from
# the 8px viewport-margin rule too
EXEMPT_VIEWPORT = ("cs-wide", "cs-frame", "cs-table")

MEASURE_JS = """(cfg) => {
  const boxes = [];
  document.querySelectorAll(
    '.cs-card, .cs-facts li, .cs-summary, .cs-col, .cs-panel, .cs-quote,' +
    '.cs-quotes .cs-quote, .cs-frame, .cs-wide, .cs-metrics, .cs-table,' +
    '.cs-timeline li, .cs-plain').forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      // a box inside a horizontal scroll container (cs-tablebox) is
      // clipped by it, not by the viewport — skip viewport checks
      let clipped = false, a = e.parentElement;
      while (a && a !== document.body) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === 'auto' || ox === 'scroll') { clipped = true; break; }
        a = a.parentElement;
      }
      boxes.push({cls: String(e.className).split(' ')[0],
                  l: r.left, r: r.right, clipped: clipped});
  });
  const textEdgeEl = document.querySelector('.cs-section .cs-eyebrow') ||
    document.querySelector('main .cs-section > p') ||
    document.querySelector('main p');
  const textEdge = textEdgeEl ? textEdgeEl.getBoundingClientRect().left : null;

  // bullet dots: rendered pseudo-geometry per list item
  const dots = [];
  const dotSel = location.pathname.indexOf('resume') !== -1
    ? 'main ul:not(.no-bullets) li'
    : 'main .cs-facts li, main .cs-col li, main .cs-card li, main .cs-plain li';
  document.querySelectorAll(dotSel).forEach(li => {
    const cs = getComputedStyle(li, '::before');
    const rendered = cs.display !== 'none' && cs.content !== 'none' &&
      cs.content !== '' && parseFloat(cs.width) > 0;
    const lr = li.getBoundingClientRect();
    let textLeft = null;
    const w = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.textContent.trim()) {
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const rr = rg.getBoundingBox ? null : rg.getBoundingClientRect();
        if (rr && rr.width) { textLeft = rr.left; break; }
      }
    }
    dots.push({rendered: rendered, liL: lr.left,
      dotL: rendered ? lr.left + parseFloat(cs.left || 0) : null,
      textL: textLeft});
  });

  // annotation dots vs their enclosing box
  const anns = [];
  document.querySelectorAll('.cs-annotation').forEach(a => {
    const dot = a.querySelector('.cs-annotation-dot');
    if (!dot) return;
    const dr = dot.getBoundingClientRect();
    let box = a.parentElement, boxL = null;
    while (box && box !== document.body) {
      const c = String(box.className || '');
      if (/cs-panel|cs-card|cs-col|cs-summary/.test(c)) {
        boxL = box.getBoundingClientRect().left;
        break;
      }
      box = box.parentElement;
    }
    anns.push({dotL: dr.left, boxL: boxL});
  });

  // resume: rendered-pseudo dot check on the small-title lists
  const resume = null;
  return {scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth, textEdge: textEdge,
          boxes: boxes, dots: dots, anns: anns};
}"""

RESUME_JS = """() => {
  const out = {unmarked: [], lists: []};
  document.querySelectorAll('main ul').forEach(ul => {
    const inSmall = ul.closest('.small-title') !== null;
    const li = ul.querySelector('li');
    if (!li) return;
    const cs = getComputedStyle(li, '::before');
    const hasDot = cs.display !== 'none' && cs.content !== 'none' &&
      cs.content !== '';
    const lr = li.getBoundingClientRect();
    let textLeft = null;
    const w = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      if (n.textContent.trim()) {
        const rg = document.createRange(); rg.selectNodeContents(n);
        const rr = rg.getBoundingClientRect();
        if (rr.width) { textLeft = rr.left; break; }
      }
    }
    const prev = ul.previousElementSibling;
    const gapAbove = prev
      ? ul.getBoundingClientRect().top - prev.getBoundingClientRect().bottom
      : null;
    out.lists.push({inSmall: inSmall, hasDot: hasDot,
      dotL: hasDot ? lr.left + parseFloat(cs.left || 0) : null,
      textL: textLeft, gapAbove: gapAbove});
  });
  return out;
}"""


def audit(baseUrl, jsonOut):
    report = {}
    failures = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for width in VIEWPORTS:
            page = b.new_page(viewport={"width": width, "height": 900})
            for path in PAGES:
                page.goto(f"{baseUrl}/{path}/", wait_until="networkidle")
                page.wait_for_timeout(250)
                d = page.evaluate(MEASURE_JS)
                key = f"{path}@{width}"
                probs = []
                te = d["textEdge"]
                bleedEdge = te - CS_INDENT if te is not None else None
                if d["scrollW"] > d["innerW"]:
                    probs.append(f"hOverflow {d['scrollW']}-{d['innerW']}")
                for bx in d["boxes"]:
                    if bx["clipped"]:
                        continue
                    if bx["l"] < -1 or bx["r"] > d["innerW"] + 1:
                        probs.append(f"{bx['cls']} crosses viewport [{bx['l']:.0f},{bx['r']:.0f}]")
                    elif bx["cls"] not in EXEMPT_VIEWPORT and (
                        bx["l"] < BOX_MARGIN or d["innerW"] - bx["r"] < BOX_MARGIN
                    ):
                        probs.append(f"{bx['cls']} within {BOX_MARGIN}px of viewport edge [{bx['l']:.0f},{bx['r']:.0f}]")
                    elif bleedEdge is not None and bx["cls"] not in EXEMPT_BLEED:
                        if abs(bx["l"] - bleedEdge) > BLEED_TOLERANCE:
                            probs.append(f"{bx['cls']} off bleed edge (l {bx['l']:.0f} vs {bleedEdge:.0f})")
                for dt in d["dots"]:
                    if dt["rendered"] and te is not None:
                        if abs(dt["dotL"] - te) > DOT_TOLERANCE:
                            probs.append(f"dot off text edge ({dt['dotL']:.1f} vs {te:.1f})")
                        # 4px clear gap after the 5px dot (ticket 35)
                        if dt["textL"] is not None and abs(dt["textL"] - dt["dotL"] - 5 - 4) > DOT_TOLERANCE:
                            probs.append(f"bullet text gap != 4px clear ({dt['textL'] - dt['dotL'] - 5:.1f})")
                for an in d["anns"]:
                    if an["boxL"] is not None and an["dotL"] < an["boxL"] - 1:
                        probs.append(f"annotation dot outside its box ({an['dotL']:.0f} < {an['boxL']:.0f})")
                report[key] = {"textEdge": te, "problems": probs}
                failures.extend(f"{key}: {x}" for x in probs)

            if width == 1440:
                page.goto(f"{baseUrl}/resume/", wait_until="networkidle")
                page.wait_for_timeout(250)
                r = page.evaluate(RESUME_JS)
                rprobs = []
                for li in r["lists"]:
                    if li["inSmall"] and li["hasDot"]:
                        rprobs.append("dot on an unmarked (.small-title) list")
                    if not li["inSmall"]:
                        # rhythm: EVERY content list keeps a gap above —
                        # dotted or not (skill detail lists are dotless
                        # by the renderer's no-bullets pattern)
                        if li["gapAbove"] is not None and li["gapAbove"] < 8:
                            rprobs.append(f"resume list gap above < 8 ({li['gapAbove']:.1f})")
                    if not li["inSmall"] and li["hasDot"]:
                        # 4px clear gap after the 5px dot (ticket 35)
                        if li["textL"] is not None and abs(li["textL"] - li["dotL"] - 5 - 4) > DOT_TOLERANCE:
                            rprobs.append(f"resume bullet text gap != 4px clear ({li['textL'] - li['dotL'] - 5:.1f})")
                report[f"resume-rules@{width}"] = {"problems": rprobs}
                failures.extend(f"resume-rules@{width}: {x}" for x in rprobs)
            page.close()
        b.close()
    if jsonOut:
        with open(jsonOut, "w") as f:
            json.dump(report, f, indent=2)
    return failures


if __name__ == "__main__":
    base = "http://localhost:3000"
    if len(sys.argv) > 1 and not sys.argv[1].startswith("--"):
        base = sys.argv[1]
    jsonOut = None
    if "--json" in sys.argv:
        jsonOut = sys.argv[sys.argv.index("--json") + 1]
    fails = audit(base, jsonOut)
    if fails:
        print(f"BOX AUDIT: {len(fails)} problem(s)")
        for f in fails:
            print("  -", f)
        sys.exit(1)
    print("BOX AUDIT CLEAN")
