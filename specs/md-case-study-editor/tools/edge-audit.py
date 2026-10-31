"""Edge audit — Ticket 18c/18d, DR-0009.

Measures every body-level text element's left edge and font size on the
content pages, grouped by component, and flags violations of the one-text-
edge system: body-level text must sit within EDGE_TOLERANCE of the page's
section text edge.

Usage:
    python3 specs/md-case-study-editor/tools/edge-audit.py [baseUrl] [--json OUT]

Requires the dev server (default http://localhost:3000) and Playwright:
    pip3 install playwright && playwright install chromium
"""
import json
import sys
from collections import defaultdict

from playwright.sync_api import sync_playwright

EDGE_TOLERANCE = 2  # px
PAGES = [
    "workflow", "teachr", "teachr-agent", "digital-closet",
    "fashion-rebrand", "sports-ecommerce-redesign", "resume",
]
VIEWPORTS = [1440, 390]

# components whose text is allowed off the edge (display/label tiers)
DISPLAY_CTX = ("cs-hero", "cs-frame", "cs-showcase", "cs-quotes",
               "cs-pullquote", "cs-summary", "cs-footnote")


def audit(baseUrl, jsonOut):
    report = {}
    failures = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for width in VIEWPORTS:
            page = b.new_page(viewport={"width": width, "height": 900})
            for path in PAGES:
                page.goto(f"{baseUrl}/{path}/", wait_until="networkidle")
                page.wait_for_timeout(300)
                rows = page.evaluate(
                    """() => {
                    const out = [];
                    document.querySelectorAll(
                      'main p, main li, main h2, main h3, main h4, main blockquote, main figcaption')
                    .forEach(e => {
                        const cs = getComputedStyle(e);
                        const r = e.getBoundingClientRect();
                        if (r.height === 0) return;
                        const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
                        let n, tx = null;
                        while ((n = w.nextNode())) {
                            if (n.textContent.trim()) {
                                const rg = document.createRange();
                                rg.selectNodeContents(n);
                                const rr = rg.getBoundingClientRect();
                                if (rr.width) { tx = rr.left; break; }
                            }
                        }
                        if (tx === null) return;
                        const ctx = [];
                        let a = e;
                        while (a && a.tagName !== 'MAIN') {
                            const c = String(a.className || '').split(' ')[0];
                            if (c && !['document-text','text-box','gallery-container','container'].includes(c))
                                ctx.unshift(c);
                            a = a.parentElement;
                        }
                        out.push({ctx: ctx.join('>'), tag: e.tagName,
                                  fs: cs.fontSize, x: Math.round(tx)});
                    });
                    return out;
                }"""
                )
                # the section text edge = the modal x of section-level p/h2
                edgeVotes = defaultdict(int)
                for r in rows:
                    if r["ctx"] in ("cs-section",) and r["tag"] in ("P", "H2"):
                        edgeVotes[r["x"]] += 1
                if not edgeVotes:
                    continue
                edge = max(edgeVotes, key=edgeVotes.get)
                pageRows = {}
                for r in rows:
                    key = f"{r['ctx']}|{r['tag']}|{r['fs']}"
                    pageRows.setdefault(key, {"x": sorted(set()), "n": 0})
                    if r["x"] not in pageRows[key]["x"]:
                        pageRows[key]["x"].append(r["x"])
                    pageRows[key]["n"] += 1
                report[f"{path}@{width}"] = {"edge": edge, "elements": pageRows}
                # violations: body-level text off the edge
                for r in rows:
                    inDisplay = any(d in r["ctx"] for d in DISPLAY_CTX)
                    isAnnotation = "cs-annotation" in r["ctx"]
                    isBullet = r["tag"] == "LI" and "cs-timeline" not in r["ctx"]
                    bodyLevel = r["tag"] in ("P", "LI", "H2", "H3", "H4", "BLOCKQUOTE")
                    if bodyLevel and not inDisplay and not isAnnotation:
                        # bullet lists may take a slight indent (DR-0009
                        # amendment): text at edge + 16px
                        allowed = (abs(r["x"] - edge) <= EDGE_TOLERANCE or
                                   (isBullet and abs(r["x"] - edge - 16) <= EDGE_TOLERANCE))
                        if not allowed:
                            failures.append(
                                f"{path}@{width}: {r['tag']} in {r['ctx']} at x={r['x']} "
                                f"(edge {r['x'] - edge:+d}px)"
                            )
            page.close()
        b.close()

    for f in failures:
        print("VIOLATION:", f)
    print(f"\n{len(failures)} violations" if failures else "\nEDGE AUDIT CLEAN")
    if jsonOut:
        with open(jsonOut, "w") as fh:
            json.dump(report, fh, indent=1)
        print("report ->", jsonOut)
    return 1 if failures else 0


if __name__ == "__main__":
    args = sys.argv[1:]
    jsonOut = None
    if "--json" in args:
        i = args.index("--json")
        jsonOut = args[i + 1]
        del args[i:i + 2]
    baseUrl = args[0] if args else "http://localhost:3000"
    sys.exit(audit(baseUrl, jsonOut))
