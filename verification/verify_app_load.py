from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Set a large viewport to ensure elements are visible
    context = browser.new_context(viewport={'width': 1280, 'height': 1024})
    page = context.new_page()

    print("Navigating to home...")
    page.goto("http://localhost:3000")

    # Wait for Auth modal and click Continue as guest
    print("Waiting for 'Continue as guest'...")
    try:
        page.wait_for_timeout(2000)
        # Handle guest login if present
        guest_btn = page.get_by_text("Continue as guest")
        if guest_btn.is_visible():
             guest_btn.click()
             print("Clicked 'Continue as guest'")
        else:
             print("'Continue as guest' not visible")
    except Exception as e:
        print(f"Error handling auth modal: {e}")

    # Wait for Dashboard content
    print("Waiting for Dashboard...")
    try:
        page.get_by_text("Project Manganese").wait_for(timeout=10000)
        print("Dashboard loaded.")
        page.screenshot(path="verification/dashboard.png")
    except:
        print("Dashboard content not found, taking screenshot for debugging")
        page.screenshot(path="verification/dashboard_error.png")
        raise

    # Navigate to Projects (Showcase)
    print("Navigating to Projects...")
    try:
        # Use a more specific locator for the sidebar button
        # The button contains the icon 'hub' and hidden text 'Showcase'
        # We can use get_by_role('button') and filter by text
        page.get_by_role("button").filter(has_text="Showcase").first.click()
    except Exception as e:
        print(f"Could not click Showcase button: {e}")
        page.screenshot(path="verification/nav_error.png")
        raise

    # Wait for Projects content
    print("Waiting for Projects...")
    try:
        page.get_by_text("Community Showcase").wait_for(timeout=10000)
        print("Projects loaded.")
        page.screenshot(path="verification/projects.png")
    except:
        print("Projects content not found")
        page.screenshot(path="verification/projects_error.png")
        raise

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
