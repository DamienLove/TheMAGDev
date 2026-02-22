from playwright.sync_api import sync_playwright, expect
import re

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()

    print("Navigating to home...")
    try:
        page.goto("http://localhost:3000", timeout=60000)
    except Exception as e:
        print(f"Navigation failed: {e}")
        page.screenshot(path="verification/nav_fail.png")
        browser.close()
        return

    # Handle Auth Modal
    print("Waiting for auth modal...")
    try:
        # Wait for either Continue as Guest or Close button
        # Increase timeout to 30s for lazy load compilation
        guest_btn = page.get_by_role("button", name=re.compile("continue as guest", re.IGNORECASE))
        if guest_btn.is_visible(timeout=30000):
            print("Clicking Continue as Guest...")
            guest_btn.click()
        else:
            print("Guest button not found, checking close button...")
            close_btn = page.locator("button[aria-label='Close']")
            if close_btn.is_visible(timeout=5000):
                 close_btn.click()
            else:
                 print("Close button not found either.")
                 page.screenshot(path="verification/auth_fail.png")
    except Exception as e:
        print(f"Auth modal handling warning: {e}")
        page.screenshot(path="verification/auth_error.png")

    # Verify Dashboard
    print("Verifying Dashboard...")
    try:
        expect(page.get_by_text("Project Manganese")).to_be_visible(timeout=10000)
        page.screenshot(path="verification/dashboard.png")
        print("Dashboard verified.")
    except Exception as e:
        print(f"Dashboard verification failed: {e}")
        page.screenshot(path="verification/dashboard_fail.png")

    # Navigate to Workspace (CodeEditor)
    print("Navigating to Workspace...")
    try:
        # Find button with 'terminal' icon
        # Sidebar uses material symbols text content for icons
        page.locator("aside button").filter(has_text="terminal").click()

        # Verify Workspace
        print("Verifying Workspace...")
        expect(page.get_by_text("TheMAG.dev Workspace")).to_be_visible(timeout=20000) # Increased for lazy load
        page.screenshot(path="verification/workspace.png")
        print("Workspace verified.")
    except Exception as e:
        print(f"Workspace verification failed: {e}")
        page.screenshot(path="verification/workspace_fail.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
