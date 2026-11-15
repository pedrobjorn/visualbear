# Ticket 6 evidence: full-page captures of the built /resume/ at 1440 + 390.
# Run from the repo root with the build served, e.g.:
#   python3 /Users/bear/.vibe/skills/webapp-testing/scripts/with_server.py \
#     --server "python3 -m http.server 8123 --directory build" --port 8123 -- \
#     python3 specs/resume-cv/tools/capture.py
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8123/resume/"
OUT = "specs/resume-cv/evidence/"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height, name in [(1440, 900, "t6-resume-1440.png"), (390, 844, "t6-resume-390.png")]:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(400)
        page.screenshot(path=OUT + name, full_page=True)
        h1 = page.locator("h1").all_inner_texts()
        print(f"{name}: h1={h1} console_errors={len(errors)}")
        for e in errors[:5]:
            print("  console error:", e)
        page.close()
    browser.close()
print("captures written to", OUT)
