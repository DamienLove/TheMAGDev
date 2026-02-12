from playwright.sync_api import sync_playwright

def verify_app_load():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to http://localhost:3000")
            page.goto("http://localhost:3000", timeout=30000)

            print("Waiting for Dashboard header 'Project Manganese'...")
            page.wait_for_selector("text=Project Manganese", timeout=15000)

            print("Dashboard loaded in DOM!")

            # Try to close the auth modal if visible
            try:
                print("Looking for 'Continue as guest' button...")
                guest_btn = page.get_by_text("Continue as guest")
                if guest_btn.is_visible():
                    print("Clicking 'Continue as guest'...")
                    guest_btn.click()
                    page.wait_for_timeout(1000) # Wait for animation
            except Exception as e:
                print(f"Could not close auth modal: {e}")

            # Take a screenshot of the dashboard
            page.screenshot(path="verification_dashboard_clean.png")
            print("Screenshot saved to verification_dashboard_clean.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_load()
