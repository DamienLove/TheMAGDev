from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})

    print("Navigating to http://localhost:3000")
    page.goto("http://localhost:3000")

    # Wait for potential Auth modal
    print("Waiting for Auth modal or content...")
    try:
        page.wait_for_selector("text=Sign in to TheMAG.dev", timeout=5000)
        print("Auth modal detected.")
        guest_btn = page.get_by_role("button", name="Continue as guest")
        if guest_btn.is_visible():
            print("Clicking 'Continue as guest'...")
            guest_btn.click()
            expect(page.get_by_text("Sign in to TheMAG.dev")).not_to_be_visible(timeout=5000)
            print("Auth modal dismissed.")
        else:
            print("'Continue as guest' button not found!")
    except Exception:
        print("Auth modal not detected or dismissed.")

    # 3. Navigate to Showcase
    print("Navigating to Showcase...")
    showcase_btn = page.get_by_role("button", name="Showcase")
    showcase_btn.click()

    expect(page.get_by_text("Community Showcase")).to_be_visible()

    # 4. Open a Project
    print("Opening a project...")
    page.get_by_role("button", name="View Implementation").first.click()

    # 5. Verify Desktop Workspace loaded
    print("Verifying Desktop Workspace...")
    expect(page.get_by_text("Explorer", exact=True)).to_be_visible(timeout=10000)

    # 6. Verify File Tree
    print("Verifying File Tree...")
    # Use strict selectors for file tree items to avoid ambiguity
    src_folder = page.locator(".truncate", has_text="src").first
    expect(src_folder).to_be_visible()

    app_tsx = page.locator(".truncate", has_text="App.tsx").first

    # If App.tsx is not visible, try to click src to expand
    if not app_tsx.is_visible():
        print("Expanding src folder...")
        src_folder.click()
        # Wait for expansion
        page.wait_for_timeout(500)

    expect(app_tsx).to_be_visible()

    # 7. Take Screenshot
    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/verification.png")

    browser.close()
    print("Verification complete.")

with sync_playwright() as playwright:
    run(playwright)
