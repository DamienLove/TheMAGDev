from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Large viewport as suggested by memory
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        try:
            print("Navigating to http://localhost:4173")
            page.goto("http://localhost:4173")

            # Wait for loading screen to disappear
            print("Waiting for loading screen to disappear...")
            # Memory says "state='hidden'" for .splash-logo
            try:
                page.wait_for_selector(".splash-logo", state="hidden", timeout=10000)
            except:
                print("Splash logo wait timed out or not found")

            # Check for Auth modal and close it if present
            # Memory says "Continue as guest" button
            print("Checking for auth modal...")

            # Use specific text matching
            guest_btn = page.get_by_role("button", name="Continue as guest")
            if not guest_btn.is_visible():
                 guest_btn = page.get_by_text("Continue as guest")

            if guest_btn.is_visible(timeout=5000):
                print("Clicking 'Continue as guest'...")
                guest_btn.click()

                # Wait for dashboard content
                page.wait_for_timeout(2000) # Give it a moment to transition
            else:
                print("Guest button not found")

            # Take a screenshot
            screenshot_path = "verification_screenshot_dashboard.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
