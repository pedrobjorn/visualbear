# Ticket 10 evidence: edge probe under the DR-0002 contract.
# Contract: body content sits 16px inside the nav `.content` box on each side
# (the nav's 16px page margin) at every width - checked as each container's
# CONTENT box (rect minus its own padding) plus the first gallery card box.
# Only image bleeds (photogrid, cs-wide--full, showcase full tier) may touch
# the viewport edge; anything else at the edge fails.
# Run from the repo root with the build served:
#   python3 /Users/bear/.vibe/skills/webapp-testing/scripts/with_server.py \
#     --server "python3 -m http.server 8123 --directory build" --port 8123 -- \
#     python3 specs/edge-alignment/tools/edge-probe.py
import json
from playwright.sync_api import sync_playwright

PAGES = [
    "/", "/play/", "/play/photography/", "/play/blog/", "/play/blog/hello-world/",
    "/workflow/", "/styleguide/", "/resume/", "/about/",
    "/fashion-rebrand/", "/steam-mobile/",
]
WIDTHS = [320, 390, 768, 1440]


def near(a, b):
    return abs(a - b) <= 0.5


JS = """() => {
  const nav = document.querySelector('nav.site-nav .content');
  const nb = nav.getBoundingClientRect();
  const out = { nav: { l: nb.left, r: nb.right }, checks: [], bleedOffenders: [] };
  const contentBox = el => {
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { l: b.left + parseFloat(cs.paddingLeft), r: b.right - parseFloat(cs.paddingRight) };
  };
  const seen = new Set();
  // .content.gallery itself spans the nav box; its cards carry the 16px gutter
  // (checked as 'card box' below). The photogrid gallery is an image bleed.
  ['.text-box', '.text-container', '.photoview-title', '.photoview-switch'].forEach(s => {
    document.querySelectorAll(s).forEach(el => {
      if (nav.contains(el) || seen.has(el)) return;
      seen.add(el);
      const b = el.getBoundingClientRect();
      if (b.width > 0) out.checks.push({ what: s, cls: String(el.className).slice(0, 40), ...contentBox(el) });
    });
  });
  const card = document.querySelector('.content.gallery .card');
  if (card && !card.closest('.gallery-grid')) {
    const b = card.getBoundingClientRect();
    out.checks.push({ what: 'card box', l: b.left, r: b.right });
  }
  // no-touch-bleed: nothing but image bleeds reaches the viewport edge
  const vw = document.documentElement.clientWidth;
  const exempt = el => el.closest('.gallery-grid, .cs-wide--full, .cs-showcase--full') || el.tagName === 'IMG';
  document.querySelectorAll('body *').forEach(el => {
    if (exempt(el)) return;
    const b = el.getBoundingClientRect();
    if (b.width > 0 && (b.left < -0.5 || b.right > vw + 0.5)) {
      out.bleedOffenders.push({ tag: el.tagName, cls: String(el.className).slice(0, 40), l: Math.round(b.left * 10) / 10, r: Math.round(b.right * 10) / 10 });
    }
  });
  out.bleedOffenders = out.bleedOffenders.slice(0, 5);
  out.scrollOverflow = document.documentElement.scrollWidth - vw;
  return out;
}"""

results = []
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for page_url in PAGES:
        for w in WIDTHS:
            page = b.new_page(viewport={"width": w, "height": 900})
            resp = page.goto("http://127.0.0.1:8123" + page_url, wait_until="networkidle")
            if resp is None or resp.status >= 400:
                results.append({"page": page_url, "width": w, "status": resp.status if resp else "navfail", "pass": False})
                page.close()
                continue
            res = page.evaluate(JS)
            nav = res["nav"]
            ok = len(res["checks"]) > 0
            for c in res["checks"]:
                if not (near(c["l"], nav["l"] + 16) and near(c["r"], nav["r"] - 16)):
                    ok = False
            if res["bleedOffenders"] or res["scrollOverflow"] > 0:
                ok = False
            results.append({"page": page_url, "width": w, "nav": nav,
                            "checks": res["checks"], "bleedOffenders": res["bleedOffenders"],
                            "scrollOverflow": res["scrollOverflow"], "pass": ok})
            page.close()
    b.close()

fails = [r for r in results if not r.get("pass")]
for r in results:
    tag = "PASS" if r.get("pass") else "FAIL"
    extra = ""
    if not r.get("pass"):
        extra = f" checks={r.get('checks')} offenders={r.get('bleedOffenders')} overflow={r.get('scrollOverflow')}"
    print(f"{tag} {r['page']:32s} {r['width']:5d} nav={r.get('nav')}{extra}")
with open("specs/edge-alignment/evidence/t10-edge-probe.json", "w") as f:
    json.dump(results, f, indent=1)
print(f"\n{len(results) - len(fails)}/{len(results)} page-width combos PASS (contract: nav box +-16, no-touch-bleed)")
