from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 1024})
    page = context.new_page()

    # Handle dialogs
    page.on("dialog", lambda dialog: dialog.accept())

    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Wait for loading screen to disappear
    print("Waiting for loading screen...")
    # Using generic locator for loading screen if needed, but memory says img alt='Loading...'
    # If not found, try waiting for main content.
    try:
        page.wait_for_selector("img[alt='Loading...']", state="hidden", timeout=10000)
    except:
        print("Loading screen not found or already gone.")

    # Check if we are on Dashboard
    # Try to find "Dashboard" text or sidebar.
    try:
        expect(page.get_by_text("Dashboard", exact=True)).to_be_visible(timeout=5000)
        print("Dashboard visible.")
    except:
        print("Dashboard not immediately visible.")

    # Try to dismiss Auth if present
    try:
        page.get_by_role("button", name="Continue as guest").click(timeout=3000)
        print("Clicked Continue as guest.")
    except:
        print("No auth modal.")

    # Take screenshot of initial state
    page.screenshot(path="verification/dashboard.png")

    # Navigate to Projects (Showcase)
    print("Clicking Showcase (hub icon) in sidebar...")
    # Sidebar uses 'hub' icon for Projects/Showcase
    try:
        # Try to find the button containing the 'hub' icon text
        page.locator("button").filter(has_text="hub").click(timeout=2000)
        print("Clicked hub icon.")
    except:
        print("Could not find hub button.")

    # Wait for Projects header
    try:
        expect(page.get_by_text("Project Templates")).to_be_visible(timeout=5000)
        print("Projects view loaded.")
    except:
        print("Projects view not loaded. Check screenshot.")
        page.screenshot(path="verification/failed_projects.png")
        browser.close()
        return

    page.screenshot(path="verification/projects.png")

    # Click Initialize Project for React
    print("Initializing React project...")
    # Find the button.
    # The card contains "React + TypeScript"
    # Button "Initialize Project"

    # We can use locator chaining or just grab the first one since React is first
    btn = page.get_by_role("button", name="Initialize Project").first

    if btn.is_visible():
        btn.click()
    else:
        print("Initialize Project button not visible.")

    # Wait for DesktopWorkspace
    try:
        expect(page.get_by_text("DevStudio Master")).to_be_visible(timeout=10000)
        print("DesktopWorkspace loaded.")
    except:
        print("DesktopWorkspace not loaded.")
        page.screenshot(path="verification/failed_workspace.png")
        browser.close()
        return

    # Check Terminal
    try:
        expect(page.get_by_text("TheMAG.dev Terminal")).to_be_visible(timeout=5000)
        print("Terminal visible.")
    except:
        print("Terminal not visible.")

    # Check File Explorer content
    try:
        expect(page.get_by_text("src")).to_be_visible()
        expect(page.get_by_text("App.tsx")).to_be_visible()
        print("Files visible.")
    except:
        print("Files not visible.")

    page.screenshot(path="verification/workspace_final.png")
    browser.close()

with sync_playwright() as p:
    run(p)
